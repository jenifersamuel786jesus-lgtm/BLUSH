const express = require('express');

const catalog = require('../data/catalog');
const Category = require('../models/Category');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    if (!_req.app.locals.dbConnected) {
      return res.json(catalog);
    }

    const categories = await Category.find().sort({ title: 1 }).lean();
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    if (!req.app.locals.dbConnected) {
      const category = catalog.find((item) => item.slug === req.params.slug);

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      return res.json(category);
    }

    const category = await Category.findOne({ slug: req.params.slug }).lean();

    const fallbackCategory = catalog.find((item) => item.slug === req.params.slug);

    if (!category && !fallbackCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json(category || fallbackCategory);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
