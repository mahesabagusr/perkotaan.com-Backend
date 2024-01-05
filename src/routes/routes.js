import express from 'express';
import { getUser, signIn, signUp, verifyOtp } from '../controller/userController.js';

const router = express.Router();

router.get('/', function (req, res) {
  res.status(200).json({ status: 'OK' });
});
router.get('/getuser', getUser)

router.post('/signup', signUp)
router.post('/signin', signIn)
router.post('/verifyotp', verifyOtp)

export default router;