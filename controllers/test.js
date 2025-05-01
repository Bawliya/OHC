const testCategory = require('../models/testcategory');
const subCategory = require('../models/testsubcategory');

// Create a new category
exports.createTestCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    if (!name || !imagePath) {
      return res.status(400).json({
        status: false,
        message: 'Name and image are required',
      });
    }

    const category = new testCategory({ name, image: imagePath });
    await category.save();

    res.status(201).json({
      status: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to create category',
      error: err.message,
    });
  }
};

exports.createSubCategory = async (req, res) => {
  try {
    const { name,price,testCategoryId } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    if (!name || !imagePath ) {
      return res.status(400).json({
        status: false,
        message: 'Name and image are required',
      });
    }

    const category = new testCategory({ name,price,testCategoryId,image: imagePath });
    await category.save();

    res.status(201).json({
      status: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to create category',
      error: err.message,
    });
  }
};


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await testCategory.find();
    res.status(200).json({
      status: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch categories',
      error: err.message,
    });
  }
};


exports.getAllSubCategories = async (req, res) => {
  try {
    const categories = await subCategory.find();
    res.status(200).json({
      status: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch categories',
      error: err.message,
    });
  }
};


exports.getCategoryById = async (req, res) => {
  try {
    const category = await testCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Category fetched successfully',
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch category',
      error: err.message,
    });
  }
};

exports.getSubCategoryById = async (req, res) => {
  try {
    const category = await subCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Category fetched successfully',
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch category',
      error: err.message,
    });
  }
};


exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const updates = { name };

    if (req.file) updates.image = req.file.filename;

    const category = await testCategory.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to update category',
      error: err.message,
    });
  }
};


exports.updateSubCategory = async (req, res) => {
  try {
    const { name,price,testCategoryId } = req.body;
    const updates = { name,price,testCategoryId};
    if (req.file) updates.image = req.file.filename;
    const category = await subCategory.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found',
      });
    }
    res.status(200).json({
      status: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to update category',
      error: err.message,
    });
  }
};
