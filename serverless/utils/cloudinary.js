// Cloudinary upload utility for serverless
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFile(fileBase64, folder = 'products') {
  return await cloudinary.uploader.upload(fileBase64, {
    folder,
    resource_type: 'auto',
  });
}

module.exports = { uploadFile };
