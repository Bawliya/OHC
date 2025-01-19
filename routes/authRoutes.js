const express = require('express');
const { login, yoga_order, getNotification, sendNotificationByType, update_device_id, get_booked_appoinment, get_lab_order, verifyOtp, otpSend, updatePasswordWithOldPassword, register, register_lab, register_pharmacy, updatePassword, hbot_order, lab_order } = require('../controllers/authController');

const router = express.Router();
const multer = require('multer');
const auth = require('../common/authMiddleware');
const uploadvideo = require("../common/multer");
const bannerController = require('../controllers/bannercontroller');
const categoryController = require('../controllers/caategorycontroller');
const homeController = require('../controllers/homeController');
const adminController = require('../controllers/admincontroller');
const chatController = require('../controllers/chatcontroller');
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

router.post('/updatePassword', auth, updatePassword);
router.post('/update_device_id', auth, update_device_id);
router.post('/updatePasswordWithOldPassword', auth, updatePasswordWithOldPassword);

// Home Page API
router.post('/hbot_order', auth, hbot_order);
router.post('/lab_order', auth, lab_order);
router.post('/yoga_order', auth, yoga_order);
router.post('/get_booked_appoinment', auth, get_booked_appoinment);
router.get('/getNotification', auth, getNotification);
router.get('/get_lab_order', auth, get_lab_order);
router.get('/home', auth, homeController.getHomePageData);
router.get('/getLabs', auth, homeController.getLabs);
router.get('/getPharmacy', auth, homeController.getPharmacy);
router.post('/searchByCityAndType', auth, homeController.searchByCityAndType);
router.get('/getService', auth, homeController.getService);
router.get('/getTestmonial', auth, homeController.getTestmonial);


router.post('/createChat', auth, chatController.createChat);
router.post('/sendMessage', auth, chatController.sendMessage);
router.post('/getChat', auth, chatController.getChat);
router.get('/getGlobalChat', auth, chatController.getGlobalChat);
router.post('/uploadimage', auth, upload.single('image'), chatController.uploadimage);







//   admin apis ===================================================>

// Admin registration route
router.post('/admin/register', adminController.registerAdmin);

// Admin login route
router.post('/admin/login', adminController.loginAdmin);

router.get('/user/get', adminController.getUsersByType);
router.post('/admin/sendNotificationByType', sendNotificationByType);

router.get('/getDashboardData', adminController.getDashboardData);
router.get('/getOrders', adminController.getOrders);
router.get('/admin/getNotification', adminController.getNotification);

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
