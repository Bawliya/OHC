const Banner = require('../models/banner'); // Assuming you have a Banner model
const Category = require('../models/category'); // Assuming you have a Category model
const userModel = require('../models/userModel');
const Video = require('../models/video');

// Fetch homepage data
exports.getHomePageData = async (req, res) => {
  try {
    // Fetch all banners
    const banners = await Banner.find();

    // Fetch all categories
    const categories = await Category.find();
    const video = await Video.find();

    // Return the data
    res.status(200).json({
      status: true,
      message: 'Home page data fetched successfully',
      data: {
        banners,
        categories,
        video
      },
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch home page data',
      error: err.message,
    });
  }
};

exports.getLabs = async (req, res) => {
    try {
      // Fetch all banners
      const labs = await userModel.find({userType:"Lab Test Doctor"});
  
      // Return the data
      res.status(200).json({
        status: true,
        message: 'Lab data fetched successfully',
        data: labs,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Failed to fetch home page data',
        error: err.message,
      });
    }
  };

exports.getPharmacy = async (req, res) => {
    try {
      // Fetch all banners
      const Pharmacy = await userModel.find({userType:"Pharmacy Clinic"});
  
      // Return the data
      res.status(200).json({
        status: true,
        message: 'Pharmacy data fetched successfully',
        data: Pharmacy,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Failed to fetch home page data',
        error: err.message,
      });
    }
  };
