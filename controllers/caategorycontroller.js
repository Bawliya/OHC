const Category = require('../models/category');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    if (!name || !imagePath) {
      return res.status(400).json({
        status: false,
        message: 'Name and image are required',
      });
    }

    const category = new Category({ name, image: imagePath });
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

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
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

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

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

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const updates = { name };

    if (req.file) updates.image = req.file.filename;

    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });

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

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Category deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to delete category',
      error: err.message,
    });
  }
};
