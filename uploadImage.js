// backend/uploadImage.js
const cloudinary = require('./cloudinaryConfig.js');
const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); // Return the image URL
      }
    ).end(file.buffer); // End the stream with the file buffer
  });
};

module.exports = uploadImage;
