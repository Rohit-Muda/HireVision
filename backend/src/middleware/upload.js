const multer = require('multer');

const storage = multer.memoryStorage();

// Accept all common video MIME types (browser recorded + uploaded files)
const ACCEPTED_VIDEO_MIMES = new Set([
  'video/webm',
  'video/mp4',
  'video/quicktime',  // .mov
  'video/x-msvideo',  // .avi
  'video/ogg',
  'video/3gpp',
  'video/x-matroska', // .mkv
  'application/octet-stream', // Some browsers send this for webm
]);

const videoUpload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || ACCEPTED_VIDEO_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only video files are allowed. Received: ${file.mimetype}`), false);
    }
  },
});

module.exports = { videoUpload };
