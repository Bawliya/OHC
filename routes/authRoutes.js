const express = require('express');
const { login, verifyOtp,otpSend,updatePasswordWithOldPassword, register,register_lab,register_pharmacy,updatePassword } = require('../controllers/authController');

const router = express.Router();
const multer = require('multer');
const auth = require('../common/authMiddleware');
const uploadvideo = require("../common/multer");
const bannerController = require('../controllers/bannercontroller');
const categoryController = require('../controllers/caategorycontroller');
const homeController = require('../controllers/homeController');
const adminController = require('../controllers/admincontroller');
const {
  createVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
} = require("../controllers/videocontroller");


// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/login', login);
router.post('/otpSend', otpSend);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/register_lab', register_lab);
router.post('/register_pharmacy', register_pharmacy);

router.post('/updatePassword',auth, updatePassword);
router.post('/updatePasswordWithOldPassword',auth, updatePasswordWithOldPassword);

// Home Page API
router.get('/home',auth, homeController.getHomePageData);
router.get('/getLabs',auth, homeController.getLabs);
router.get('/getPharmacy',auth, homeController.getPharmacy);
router.post('/searchByCityAndType',auth, homeController.searchByCityAndType);


 

//   admin apis ===================================================>

  // Admin registration route
router.post('/admin/register', adminController.registerAdmin);

// Admin login route
router.post('/admin/login', adminController.loginAdmin);

router.post('/banneradd', upload.single('image'), bannerController.createBanner);
router.get('/bannerget', bannerController.getAllBanners);
router.get('/bannergetone/:id', bannerController.getBannerById);
router.put('/bannerupdate/:id', upload.single('image'), bannerController.updateBanner);
router.delete('/bannerdelete/:id', bannerController.deleteBanner);

router.post('/categoryadd/', upload.single('image'), categoryController.createCategory);
router.get('/categoryget/', categoryController.getAllCategories);
router.get('/categorygetone/:id', categoryController.getCategoryById);
router.put('/categoryupdate/:id', upload.single('image'), categoryController.updateCategory);
router.delete('/categoryupdate/:id', categoryController.deleteCategory);

router.post("/videoadd", upload.fields([
  { name: "video", maxCount: 1 },
  { name: "image", maxCount: 1 },
]), createVideo);
router.get("/videoget", getAllVideos);
router.get("/videoupdate/:id", getVideoById);
router.delete("/videodelete/:id", deleteVideo);


module.exports = router; 
