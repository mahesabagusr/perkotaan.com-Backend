import joi from 'joi';

export const uploadProjectSchema = joi.object().keys({
  projectName: joi.string().required().messages({
    'string.empty': 'Harap isi projectName'
  }),
  description: joi.string().required().messages({
    'string.empty': 'Harap isi description'
  }),
  budget: joi.number().required().messages({
    'string.empty': 'Harap isi budget'
  }),
  targetTime: joi.string().required().messages({
    'string.empty': 'Harap isi targetTime'
  }),
  startTime: joi.string().required().messages({
    'string.empty': 'Harap isi startTime'
  }),
  cityId: joi.number().required().messages({
    'string.empty': 'Harap isi city_id'
  }),
  // imageUrl: joi.string().required().messages({
  //   'string.empty': 'Harap isi image'
  // })
});

export const submissionProjectSchema = joi.object().keys({
  name: joi.string().required().messages({
    'string.empty': 'Harap isi Nama Lengkap'
  }),
  village: joi.string().required().messages({
    'string.empty': 'Harap isi RT/Kecamatan'
  }),
  address: joi.string().required().messages({
    'string.empty': 'Harap isi Alamat'
  }),
  reason: joi.string().required().messages({
    'string.empty': 'Harap isi Alasan Kamu'
  }),
})