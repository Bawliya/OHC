const Video = require("../models/video");
const path = require("path");

// Create a new video
exports.createVideo = async (req, res) => {
  try {
    const { type, title, description, youTubeUrl, video_type } = req.body;

    // Validate YouTube URL if type is "youtube"
    if (type === "youtube" && !youTubeUrl) {
      return res
        .status(400)
        .json({ message: "YouTube URL is required for type 'youtube'", status: false });
    }

    // Validate uploaded files if type is "video"
    if (type === "video" && (!req.files || !req.files.video)) {
      return res
        .status(400)
        .json({ message: "Video file is required for type 'video'", status: false });
    }

    // Validate uploaded image
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image file is required", status: false });
    }

    // Create video document
    const videoData = {
      type,
      title,
      description,
      video_type,
      youTubeUrl: type === "youtube" ? youTubeUrl : null,
      videoPath: type === "video" ? req.files.video[0].filename : null,
      image: req.files.image[0].filename, // Save the uploaded image file
    };

    const video = new Video(videoData);
    await video.save();

    res
      .status(201)
      .json({ status: true, message: "Video created successfully", video });
  } catch (error) {
    res.status(500).json({ message: "Error creating video", error, status: false });
  }
};

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json({ message: "Videos retrieved successfully", videos ,status:true});
  } catch (error) {
    res.status(500).json({ message: "Error fetching videos", error ,status:false});
  }
};

// Get a single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found",status:false });
    }
    res.status(200).json({ message: "Video retrieved successfully", video,status:true });
  } catch (error) {
    res.status(500).json({ message: "Error fetching video", error ,status:false});
  }
};

// Delete a video by ID
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" ,status:false});
    }
    res.status(200).json({ message: "Video deleted successfully", video,status:true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting video", error,status:false});
  }
};
