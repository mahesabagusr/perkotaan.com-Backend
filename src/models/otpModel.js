import joi from 'joi';

export const otpSchema = joi.object().keys({
  otp: joi.string().required().messages({
    'string.empty': 'Harap isi Kode OTP Kamu'
  }),
  email: joi.string().email().required().messages({
    'string.empty': 'Harap isi Email',
  }),
});