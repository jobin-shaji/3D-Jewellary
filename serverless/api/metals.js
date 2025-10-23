const connectToDatabase = require('../utils/mongodb');
const Metal = require('../models/metal');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/metals - list all metals
  if (req.method === 'GET') {
    try {
      const metals = await Metal.find();
      res.status(200).json({ metals });
    } catch (error) {
      console.error('Get metals error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // POST /api/metals - create a new metal
  if (req.method === 'POST') {
    try {
      const { type, purity, price } = req.body;
      if (!type || !purity || !price) {
        return res.status(400).json({ message: 'Type, purity, and price required' });
      }
      const metal = new Metal({ type, purity, price });
      await metal.save();
      res.status(201).json({ message: 'Metal created', metal });
    } catch (error) {
      console.error('Create metal error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // PUT /api/metals?id=METAL_ID - update a metal
  if (req.method === 'PUT' && req.query.id) {
    try {
      const metalId = req.query.id;
      const { type, purity, price } = req.body;
      const updatedMetal = await Metal.findByIdAndUpdate(metalId, { type, purity, price }, { new: true });
      if (!updatedMetal) {
        return res.status(404).json({ message: 'Metal not found' });
      }
      res.status(200).json({ message: 'Metal updated', metal: updatedMetal });
    } catch (error) {
      console.error('Update metal error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // DELETE /api/metals?id=METAL_ID - delete a metal
  if (req.method === 'DELETE' && req.query.id) {
    try {
      const metalId = req.query.id;
      const deletedMetal = await Metal.findByIdAndDelete(metalId);
      if (!deletedMetal) {
        return res.status(404).json({ message: 'Metal not found' });
      }
      res.status(200).json({ message: 'Metal deleted', deletedMetalId: metalId });
    } catch (error) {
      console.error('Delete metal error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
