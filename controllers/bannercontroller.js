const Banner = require('../models/banner');

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file.filename;

    const newBanner = new Banner({ name, image });
    await newBanner.save();

    res.status(201).json({
      status: true,
      message: 'Banner created successfully',
      data: newBanner,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to create banner',
      error: err.message,
    });
  }
};

// Get all banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({
      status: true,
      message: 'Banners fetched successfully',
      data: banners,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch banners',
      error: err.message,
    });
  }
};

// Get a single banner
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner)
      return res.status(404).json({
        status: false,
        message: 'Banner not found',
      });

    res.status(200).json({
      status: true,
      message: 'Banner fetched successfully',
      data: banner,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch banner',
      error: err.message,
    });
  }
};

// Update a banner
exports.updateBanner = async (req, res) => {
  try {
    const { name } = req.body;
    const updates = { name };

    if (req.file) updates.image = req.file.filename;

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedBanner)
      return res.status(404).json({
        status: false,
        message: 'Banner not found',
      });

    res.status(200).json({
      status: true,
      message: 'Banner updated successfully',
      data: updatedBanner,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to update banner',
      error: err.message,
    });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
    if (!deletedBanner)
      return res.status(404).json({
        status: false,
        message: 'Banner not found',
      });

    res.status(200).json({
      status: true,
      message: 'Banner deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to delete banner',
      error: err.message,
    });
  }
};
