const Banner = require('../models/banner'); // Assuming you have a Banner model
const Category = require('../models/category'); // Assuming you have a Category model
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
