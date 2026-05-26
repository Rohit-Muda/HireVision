const multer = require('multer');

const storage = multer.memoryStorage();

// Accept all common video MIME types from browsers and file systems.
// MediaRecorder can produce compound types like 'video/webm;codecs=vp9,opus'
// or empty string when codec negotiation fails.
const ACCEPTED_VIDEO_MIMES = new Set([
  'video/webm',
  'video/mp4',
  'video/quicktime',        // .mov
  'video/x-msvideo',        // .avi
  'video/ogg',
  'video/3gpp',
  'video/x-matroska',       // .mkv
  'application/octet-stream', // Firefox/Safari fallback
]);

const isAcceptedVideo = (mimetype) => {
  if (!mimetype || mimetype === '') return true; // empty = let it through (blob with no type)
  const base = mimetype.split(';')[0].trim().toLowerCase(); // strip ;codecs=... part
  return base.startsWith('video/') || ACCEPTED_VIDEO_MIMES.has(base);
};

const videoUpload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    if (isAcceptedVideo(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only video files are allowed. Received: ${file.mimetype}`), false);
    }
  },
});

const pdfUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error(`Only PDF files are allowed. Received: ${file.mimetype}`), false);
    }
  },
});

module.exports = { videoUpload, pdfUpload };
