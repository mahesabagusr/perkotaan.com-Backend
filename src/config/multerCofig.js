import multer from 'multer'

export const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../../images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + `-` + file.originalname)
  }
});

export const fileFilter = (req, file, cb) => {
  if (file.minetipe === 'image/png' || file.minetipe === 'image/jpg' || file.minetipe === 'image/jpeg ') {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
}