const { admin } = require('../config/firebase');

/**
 * Upload a buffer to Firebase Storage and return public URL
 * @param {Buffer} buffer - file buffer
 * @param {string} destination - storage path e.g. videos/uid/timestamp.webm
 * @param {string} mimeType - e.g. video/webm
 * @returns {Promise<string>} public URL
 */
const uploadToStorage = async (buffer, destination, mimeType = 'video/webm') => {
  const bucket = admin.storage().bucket();
  const file = bucket.file(destination);

  await file.save(buffer, {
    metadata: { contentType: mimeType },
    resumable: false,
  });

  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
  return publicUrl;
};

module.exports = { uploadToStorage };
