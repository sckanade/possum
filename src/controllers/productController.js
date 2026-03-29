const { Product, Category } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { validateRequired } = require("../middlewares/validate");
const { prefixedId } = require("../utils/ids");

const productInclude = [
  {
    model: Category,
    as: "category"
  }
];

const listProducts = asyncHandler(async (req, res) => {
  const where = {};

  if (req.query.categoryId) {
    where.categoryId = req.query.categoryId;
  }

  const products = await Product.findAll({
    where,
    include: productInclude,
    order: [["createdAt", "DESC"]]
  });

  res.json(products);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.productId, {
    include: productInclude
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  validateRequired(["name", "stock", "price", "categoryId"], req.body);

  const category = await Category.findByPk(req.body.categoryId);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const product = await Product.create({
    id: prefixedId("PRD"),
    name: req.body.name,
    stock: Number(req.body.stock),
    price: Number(req.body.price),
    imageUrl: req.body.imageUrl || null,
    categoryId: req.body.categoryId
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.productId);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (req.body.categoryId) {
    const category = await Category.findByPk(req.body.categoryId);
    if (!category) {
      throw new AppError(404, "Category not found");
    }
  }

  await product.update({
    name: req.body.name ?? product.name,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : product.stock,
    price: req.body.price !== undefined ? Number(req.body.price) : product.price,
    imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : product.imageUrl,
    categoryId: req.body.categoryId ?? product.categoryId
  });

  res.json(product);
});

const updateStock = asyncHandler(async (req, res) => {
  validateRequired(["quantity"], req.body);

  const product = await Product.findByPk(req.params.productId);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const quantity = Number(req.body.quantity);
  const nextStock = product.stock + quantity;

  if (nextStock < 0) {
    throw new AppError(400, "Insufficient stock");
  }

  await product.update({ stock: nextStock });

  res.json(product);
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateStock
};
