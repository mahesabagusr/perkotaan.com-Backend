import express from 'express';
import { getUser, signIn, signUp, verifyOtp, logOut } from '../controller/userController.js';
import { getProjectByUid, getProjectWithPagination,getAllProjects, postProject, searchCity, searchProvince, getProvince, getCity, getCityById, getCityByProvinceId } from '../controller/projectController.js'
import { verifyToken } from '../middlewares/jwt.js';
import { refreshToken } from '../controller/refreshToken.js';
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
router.post('/token', refreshToken)

// Province Routes
router.post('/province/search', searchProvince)
router.post('/city/search', searchCity)
router.get('/province/get', getProvince)
router.get('/city/get', getCity)
router.get('/city/get/:id', getCityById)
router.get('/city/get/province/:id', getCityByProvinceId)

//Project Routes
router.post('/project/upload', postProject)
router.get('/project/get/:page/:pageSize', getProjectWithPagination)
router.get('/project/get', getAllProjects)
router.get('/project/getuid/:uid', getProjectByUid)

export default router;