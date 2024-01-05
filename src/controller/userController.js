import bcrypt from 'bcrypt'
import store from 'store'
import { nanoid } from 'nanoid'
import supabase from '../config/supabaseClient.js';
import { userSchema, otpSchema, signInSchema } from '../models/model.js';
import { sendMail, generateOtp } from '../services/sendEmail.js';
import { createToken, createRefreshToken } from '../middlewares/jwt.js';

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

    const { email, username, password, firstName, lastName, age } = req.body

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    console.log(existingUser);

    if (existingUser.length > 0) {
      throw new Error('Email already exists');
    }

    const { otp, expirationTime } = await generateOtp()
    const success = await sendMail(email, otp)

    if (!success) {
      throw new Error('Register Gagal, Kode verifikasi gagal dikirim');
    }

    const signature = nanoid(4);
    const hashPassword = await bcrypt.hash(password, 10);
    const verified = false;

    store.set('data', {
      username: username, firstName: firstName, lastName: lastName, age: age, email: email, password: hashPassword, signature: signature, verified: verified, otp: otp, expirationTime: expirationTime
    })

    const response = res.status(200).json({
      status: 'success',
      message: 'Register Berhasil, Cek Email Kamu untuk melihat verifikasi kode OTP kamu',
    })

    return response

  } catch (err) {
    res.json({
      status: 'fail',
      message: err.message
    })
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
      throw new Error(err)
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
    const { email, username, password } = req.body

    const { error, value } = signInSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Verifikasi Gagal, ${error.message}`
      })
      return response
    };

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username}, email.eq.${email}`)

    if (!user) {
      return new Error('Silakan Masukkan Email atau Password yang benar')
    }

    console.log(user[0].id)

    const isValid = bcrypt.compare(password, user[0].password)

    if (!isValid) {
      return new Error('Password salah')
    }

    const { accessToken } = createToken({ id: user[0].id, name: user[0].name, email: user[0].email, signature: user[0].signature })
    const { refreshToken } = createRefreshToken({ id: user[0].id, name: user[0].name, email: user[0].email, signature: user[0].signature })

    const { data: status } = await supabase
      .from('users')
      .update({ refresh_token: refreshToken })
      .eq('id', user[0].id)
    // res.json({ status })

    res.cookie('refreshToken', refreshToken, {
      httOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(200).json({ accessToken })

  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'err.message'
    })
  }
}

export const getUser = async (req, res) => {
  try {
    const { data } = await supabase.auth.getUser()

    res.status(200).json({ data })
  } catch (err) {

  }

}