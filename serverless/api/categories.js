const connectToDatabase = require('../utils/mongodb');
const Category = require('../models/category');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/categories - list all categories
  if (req.method === 'GET') {
    try {
      const categories = await Category.find();
      res.status(200).json({ categories });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // POST /api/categories - create a new category
  if (req.method === 'POST') {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Category name required' });
      }
      const category = new Category({ name });
      await category.save();
      res.status(201).json({ message: 'Category created', category });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // PUT /api/categories?id=CATEGORY_ID - update a category
  if (req.method === 'PUT' && req.query.id) {
    try {
      const categoryId = req.query.id;
      const { name } = req.body;
      const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name }, { new: true });
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json({ message: 'Category updated', category: updatedCategory });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // DELETE /api/categories?id=CATEGORY_ID - delete a category
  if (req.method === 'DELETE' && req.query.id) {
    try {
      const categoryId = req.query.id;
      const deletedCategory = await Category.findByIdAndDelete(categoryId);
      if (!deletedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json({ message: 'Category deleted', deletedCategoryId: categoryId });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
