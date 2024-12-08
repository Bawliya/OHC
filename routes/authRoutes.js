const express = require('express');
const { login, verifyOtp, register,register_lab,register_pharmacy } = require('../controllers/authController');

const router = express.Router();
const multer = require('multer');
const auth = require('../common/authMiddleware');
const bannerController = require('../controllers/bannercontroller');
const categoryController = require('../controllers/caategorycontroller');
const homeController = require('../controllers/homeController');
const adminController = require('../controllers/admincontroller');


// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/register_lab', register_lab);
router.post('/register_pharmacy', register_pharmacy);

// Home Page API
router.get('/home',auth, homeController.getHomePageData);


 

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


module.exports = router; 
