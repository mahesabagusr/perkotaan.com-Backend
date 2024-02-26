import bcrypt from 'bcrypt'
import store from 'store'
import { nanoid } from 'nanoid'
import supabase from '../config/supabaseConfig.js';
import { userSchema, otpSchema, signInSchema } from '../models/model.js';
import { sendMail, generateOtp } from '../services/sendEmailService.js';
import { createToken, createRefreshToken } from '../middlewares/jwt.js';
import { imageUpload, getImageUrl } from '../services/projectService.js';

export const signUp = async (req, res) => {
  try {
    const { error, value } = await userSchema.validate(req.body, { abortEarly: false })

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `${error.message}`
      })
      return response
    };

    const { email, username, password, confirmPassword, firstName, lastName, age } = req.body

    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (existingEmail.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email sudah Terdaftar'
      })
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username);

    if (existingUser.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username sudah Terdaftar'
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password dan Confirm Password tidak cocok'
      })
    }

    // const { otp, expirationTime } = await generateOtp()
    // const success = await sendMail(email, otp)

    // if (!success) {
    //   throw new Error('Register Gagal, Kode verifikasi gagal dikirim');
    // }
    const imageUrl = await getImageUrl('public', 'user_images', 'pp.jpg')
    const signature = nanoid(4);
    const hashPassword = await bcrypt.hash(password, 10);
    const role = 'user';

    const { error: err } = await supabase
      .from('users')
      .insert({ username: username, email: email, password: hashPassword, first_name: firstName, last_name: lastName, age: age, role: role, signature: signature, status: true, image_url: imageUrl })
      .select()

    if (err) {
      return res.status(400).json({
        status: 'fail',
        message: err
      })
    }

    const response = res.status(200).json({
      status: 'success',
      message: 'Register Berhasil, Silakan Masuk ke Menu Login',
    })

    return response

  } catch (err) {
    // res.status(500).json({
    //   status: 'fail',
    //   message: err.message
    // })
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { error, value } = otpSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Verifikasi Gagal, ${error.message}`
      })
      return response
    };

    const { email, otp } = req.body;

    const user = store.get('data')

    if (!user) {
      const response = res.status(400).json({
        status: 'fail',
        message: 'Verifikasi Gagal, data tidak ada',
      });
      return response
    }

    //if email doesn't exist
    if (user.email !== email) {
      const response = res.status(400).json({
        status: 'fail',
        message: 'Verifikasi Gagal, Email tidak ditemukan',
      });
      return response
    }

    //if otp code wrong
    if (user.otp !== otp) {
      const response = res.status(400).json({
        status: 'fail',
        message: 'Verifikasi Gagal, Kode OTP Salah',
      });
      return response
    }

    const date = Date.now()

    //if otp code was expired
    if (user.expirationTime < date) {
      const response = res.status(400).json({
        status: 'fail',
        message: 'Verifikasi Gagal, Kode OTP Kadaluarsa',
      });
      return response
    }

    //if success
    const { error: err } = await supabase
      .from('users')
      .insert({ username: user.username, email: user.email, password: user.password, first_name: user.firstName, last_name: user.lastName, signature: user.signature, status: true })
      .select()

    if (err) {
      const response = res.status(400).json({
        status: 'fail',
        message: 'Verifikasi Gagal',
      });
      return response
    }

    const response = res.status(200).json({
      status: 'success',
      message: 'Verifikasi Berhasil, Silakkan masuk ke Menu Login',
    });
    return response

  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    })
  }
}

export const signIn = async (req, res) => {
  try {
    const { username, email, password } = req.body

    const { error, value } = signInSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Login Gagal, ${error.message}`
      })
      return response
    };

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username}, email.eq.${email}`)

    if (!user || user.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Silakan Masukkan Email atau username yang benar'
      })
    }

    const isValid = await bcrypt.compare(password, user[0].password)

    if (!isValid) {
      return res.status(404).json({
        status: 'fail',
        message: 'Silakan Masukkan Password yang benar'
      })
    }

    const { accessToken } = createToken({ id: user[0].id, name: user[0].name, email: user[0].email, signature: user[0].signature })
    const { refreshToken } = createRefreshToken({ id: user[0].id, name: user[0].name, email: user[0].email, signature: user[0].signature })

    const { data: status } = await supabase
      .from('users')
      .update({ refresh_token: refreshToken })
      .eq('id', user[0].id)

    res.cookie('refreshToken', refreshToken, {
      httOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(200).json({ accessToken })

  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    })
  }
}

export const logOut = async (req, res) => {
  try {

    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(204);

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('refresh_token', refreshToken);

    if (!token[0]) return res.status(204);

    await supabase
      .from('users')
      .update({ refresh_token: null })
      .eq('id', user[0].id)

    res.clearCookie('refreshToken')

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil Logout'
    });

  } catch (err) {
    return res.status(200).json({
      status: 'fail',
      message: `Gagal Logout, ${err.message}`
    });
  }

}

export const getUser = async (req, res) => {
  try {
    const { id } = req.params
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)

    res.status(200).json({ user: users })
  } catch (err) {
    return res.status(200).json({
      status: 'fail',
      message: `Gagal get User, ${err.message}`
    });
  }
}

