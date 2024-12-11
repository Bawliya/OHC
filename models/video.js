const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["youtube", "video"], // Allowed values
      required: true,
    },
    video_type: {
      type: String,
      enum: ["yoga", "service","testmonial"], // Allowed values
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    youTubeUrl: {
      type: String,
      required: function () {
        return this.type === "youtube"; // Required only for YouTube type
      },
    },
    videoPath: {
      type: String,
      required: function () {
        return this.type === "video"; // Required only for video type
      },
    },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
