const { uploadFile } = require('../utils/cloudinary');

module.exports = async (req, res) => {
  // POST /api/upload - upload a file to Cloudinary
  if (req.method === 'POST') {
    try {
      const { fileBase64, folder } = req.body;
      if (!fileBase64) {
        return res.status(400).json({ message: 'fileBase64 required' });
      }
      const result = await uploadFile(fileBase64, folder);
      res.status(201).json({
        message: 'File uploaded successfully',
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
