const { Category } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { validateRequired } = require("../middlewares/validate");

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.findAll({
    order: [["name", "ASC"]]
  });

  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  validateRequired(["name"], req.body);

  const category = await Category.create({
    name: req.body.name,
    description: req.body.description || null
  });

  res.status(201).json(category);
});

module.exports = {
  listCategories,
  createCategory
};
