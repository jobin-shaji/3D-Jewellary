const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for image uploads
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
    ]
  }
});

// Configure multer for certificate uploads
const certificateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products/certificates',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    resource_type: 'auto'
  }
});

// Configure multer for 3D model uploads
const modelStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products/models',
    resource_type: 'raw',
    // Remove allowed_formats to allow any format for now
    // allowed_formats: ['glb', 'gltf', 'obj', 'fbx'],
  }
});

// Create multer upload instances
const uploadImage = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadCertificate = multer({ 
  storage: certificateStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for certificates
});

const uploadModel = multer({ 
  storage: modelStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit to match Cloudinary free plan
  fileFilter: (req, file, cb) => {
    console.log('File filter - Original name:', file.originalname);
    console.log('File filter - Mimetype:', file.mimetype);
    console.log('File filter - Size:', file.size || 'Size not available at this stage');
    
    // Check file extension
    const allowedExtensions = ['.glb', '.gltf', '.obj', '.fbx'];
    const fileExtension = file.originalname.toLowerCase().split('.').pop();
    
    if (allowedExtensions.includes(`.${fileExtension}`)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed formats: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

module.exports = {
  cloudinary,
  uploadImage,
  uploadCertificate,
  uploadModel
};