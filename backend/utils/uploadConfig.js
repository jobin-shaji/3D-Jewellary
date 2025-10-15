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

// Configure multer for invoice uploads
const invoiceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products/invoices',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    resource_type: 'auto'
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


/**
 * Upload PDF buffer to Cloudinary
 * @param {Buffer} pdfBuffer - PDF buffer to upload
 * @param {string} orderId - Order ID for naming
 * @returns {Promise<Object>} - Cloudinary upload result
 */
async function uploadPDFToCloudinary(pdfBuffer, orderId) {
  try {
    console.log('🔄 Uploading PDF to Cloudinary...');
    console.log('📄 PDF size:', pdfBuffer.length, 'bytes');
    
    // Upload options for public access
    const uploadOptions = {
      folder: 'products/invoices',
      resource_type: 'auto',
      public_id: `invoice_${orderId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
      format: 'pdf',
      type: 'upload', // Explicitly set to 'upload' type for public access
      overwrite: true,
      invalidate: true,
      tags: ['invoice', 'pdf', 'jewelry'],
    };

    // Try upload using stream approach
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            
            // Handle specific untrusted account error
            if (error.message && error.message.includes('untrusted')) {
              console.log('🔄 Attempting alternative upload method for untrusted account...');
              // Fallback: try with minimal options for maximum compatibility
              const fallbackOptions = {
                folder: 'products/invoices',
                resource_type: 'auto',
                public_id: `invoice_${Date.now()}`,
                type: 'upload', // Explicitly set to 'upload' type
              };
              
              cloudinary.uploader.upload_stream(
                fallbackOptions,
                (fallbackError, fallbackResult) => {
                  if (fallbackError) {
                    reject(new Error(`Failed to upload invoice (fallback): ${fallbackError.message}`));
                  } else {
                    console.log('✅ Fallback upload successful:', fallbackResult.public_id);
                    resolve(fallbackResult);
                  }
                }
              ).end(pdfBuffer);
            } else {
              reject(new Error(`Failed to upload invoice: ${error.message}`));
            }
          } else {
            console.log('✅ Invoice uploaded to Cloudinary:', result.public_id);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(pdfBuffer);
    });

    return result;
    
  } catch (error) {
    console.error('❌ PDF upload error:', error);
    throw new Error(`Failed to upload invoice PDF: ${error.message}`);
  }
}

module.exports = {
  cloudinary,
  uploadImage,
  uploadCertificate,
  uploadModel,
  uploadPDFToCloudinary
};