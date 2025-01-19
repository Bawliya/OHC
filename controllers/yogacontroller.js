const yoga = require("../models/yoga");

exports.createOrUpdate = async (req, res) => {
  try {
    const { time, link, duration } = req.body;

    // Create or Update the yoga document
    const updatedYoga = await yoga.findOneAndUpdate(
      {}, // Match condition: Empty object to ensure only one document
      { time, link, duration }, // Fields to update or insert
      { upsert: true, new: true } // Create if not found, return the updated/new document
    );

    res.status(200).json({
      status: true,
      message: "Yoga entry created or updated successfully",
      data: updatedYoga,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating or updating yoga entry",
      error,
      status: false,
    });
  }
};
