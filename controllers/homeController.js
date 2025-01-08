const Banner = require('../models/banner'); // Assuming you have a Banner model
const Category = require('../models/category'); // Assuming you have a Category model
const userModel = require('../models/userModel');
const LabTest = require('../models/labtest');
const Video = require('../models/video');

// Fetch homepage data
exports.getHomePageData = async (req, res) => {
  try {
    // Fetch all banners
    const banners = await Banner.find();

    // Fetch all categories
    const categories = await Category.find();
    const service = await Video.find({video_type:"service"});
    const testmonial = await Video.find({video_type:"testmonial"});

    // Return the data
    res.status(200).json({
      status: true,
      message: 'Home page data fetched successfully',
      data: {
        banners,
        categories,
        service,
        testmonial
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
    // Fetch all labs and their associated tests
    const labs = await userModel.find({ userType: "Lab Test Doctor" })
      .lean() // Optional: Makes the result plain JS objects
      .then(async (labs) => {
        // Fetch tests for each lab and add them to the corresponding lab object
        const labTests = await Promise.all(
          labs.map(async (lab) => {
            const tests = await LabTest.find({ lab_id: lab._id });
            return { ...lab, tests }; // Attach the tests array to the lab object
          })
        );
        return labTests;
      });

    // Return the data
    res.status(200).json({
      status: true,
      message: 'Lab data fetched successfully',
      data: labs,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch lab data',
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

  exports.searchByCityAndType = async (req, res) => {
    try {
      // Extract query parameters
      const { type, city } = req.body;
  
      // Validate query parameters
      if (!type || !city) {
        return res.status(400).json({
          status: false,
          message: 'Type and City parameters are required',
        });
      }
  
      // Fetch data based on userType and city
      const data = await userModel.find({
        userType: type,
        city: { $regex: new RegExp(city, 'i') }, // Case-insensitive search for city
      });
  
      // Return the result
      res.status(200).json({
        status: true,
        message: 'Search results fetched successfully',
        data,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Failed to fetch search results',
        error: err.message,
      });
    }
  };

  exports.getService = async (req, res) => {
    try {
      const service = await Video.find({video_type:"service"});
  
      // Return the data
      res.status(200).json({
        status: true,
        message: 'Service data fetched successfully',
        data: service,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Failed to fetch Service data',
        error: err.message,
      });
    }
  };
  exports.getTestmonial = async (req, res) => {
    try {
      const testmonial = await Video.find({video_type:"testmonial"});
  
      // Return the data
      res.status(200).json({
        status: true,
        message: 'Testmonial data fetched successfully',
        data: testmonial,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Failed to fetch Testmonial data',
        error: err.message,
      });
    }
  };
  
