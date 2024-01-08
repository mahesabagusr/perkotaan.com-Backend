import express from 'express';
import { getUser, signIn, signUp, verifyOtp, logOut } from '../controller/userController.js';
import { getProjectByUid, getProjectWithPagination, postProject, searchCity, searchProvince, getProvince, getCity, getCityById } from '../controller/projectController.js'
import { verifyToken } from '../middlewares/jwt.js';
import { imageUpload } from '../services/projectService.js';

const router = express.Router();

router.get('/', function (req, res) {
  res.status(200).json({ status: 'OK' });
});
router.get('/getuser', getUser)

// User Routes
router.post('/signup', signUp)
router.post('/signin', signIn)
router.post('/verifyotp', verifyOtp)
router.post('/logout', logOut)

// Province Routes
router.post('/province/search', searchProvince)
router.post('/city/search', searchCity)
router.get('/province/get', getProvince)
router.get('/city/get', getCity)
router.get('/city/get/:id', getCityById)

//Project Routes
router.post('/project/upload', postProject)
router.get('/project/get/:page/:pageSize', verifyToken, getProjectWithPagination)
router.get('/project/getuid/:uid', getProjectByUid)

export default router;