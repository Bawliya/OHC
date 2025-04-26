// const multer = require("multer");
// const path = require("path");

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/video"); // Folder where files will be stored
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
//   },
// });

// // File filter for video uploads
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["video/mp4", "video/mkv", "video/avi"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only video files are allowed!"), false);
//   }
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;

const multer = require("multer");
const path = require("path");

// Configure storage for video and image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") {
      cb(null, "uploads/video"); // Video files folder
    } else if (file.fieldname === "image") {
      cb(null, "uploads/image"); // Image files folder
    } else if (file.fieldname === "report") {
      cb(null, "uploads/report"); // Report files folder
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// File filter for video and image uploads
const fileFilter = (req, file, cb) => {
  const allowedVideoTypes = ["video/mp4", "video/mkv", "video/avi"];
  const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const allowedReportTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

  if (file.fieldname === "video" && allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === "image" && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  }
  else if (file.fieldname === "report" && allowedReportTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;

