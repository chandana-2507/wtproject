const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const slugify = require('../utils/slugify');
const Product = require('../models/Product');
const Review = require('../models/Review');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const APIFeatures = require('../utils/apiFeatures');
const { countFilteredTotal } = require('../utils/apiFeatures');

const createRules = [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').trim().notEmpty(),
  body('brand').trim().notEmpty(),
];

const updateRules = [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
];

const getProducts = asyncHandler(async (req, res) => {
  const total = await countFilteredTotal(Product, req.query);
  const features = new APIFeatures(Product.find(), req.query);
  features.filter().sort().limitFields().paginate();
  const products = await features.query;

  const page = features.page || 1;
  const limit = features.limit || 12;
  const pages = Math.ceil(total / limit) || 1;

  res.json({
    success: true,
    count: products.length,
    total,
    page,
    pages,
    products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.json({ success: true, product, reviews });
});

const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  let slug = slugify(req.body.name);
  let unique = slug;
  let n = 1;
  while (await Product.findOne({ slug: unique })) {
    unique = `${slug}-${n}`;
    n += 1;
  }
  slug = unique;

  const images = [];
  if (req.files?.length) {
    for (const file of req.files) {
      const uploaded = await cloudinary.uploader.upload(file.path, { folder: 'ecommerce/products' });
      fs.unlink(file.path, () => {});
      images.push({ url: uploaded.secure_url, public_id: uploaded.public_id });
    }
  } else {
    res.status(400);
    throw new Error('At least one product image is required');
  }

  const variants = req.body.variants ? JSON.parse(req.body.variants) : [];
  const comparePrice = req.body.comparePrice ? Number(req.body.comparePrice) : 0;
  const stock = req.body.stock != null ? Number(req.body.stock) : 0;

  const product = await Product.create({
    name: req.body.name,
    slug,
    description: req.body.description,
    price: Number(req.body.price),
    comparePrice,
    category: req.body.category,
    brand: req.body.brand,
    images,
    stock,
    variants,
    isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
  });

  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = ['name', 'description', 'price', 'comparePrice', 'category', 'brand', 'stock', 'isFeatured'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      if (f === 'price' || f === 'comparePrice' || f === 'stock') product[f] = Number(req.body[f]);
      else if (f === 'isFeatured') product[f] = req.body[f] === true || req.body[f] === 'true';
      else product[f] = req.body[f];
    }
  });

  if (req.body.name) {
    product.slug = slugify(req.body.name);
    let unique = product.slug;
    let n = 1;
    while (await Product.findOne({ slug: unique, _id: { $ne: product._id } })) {
      unique = `${slugify(req.body.name)}-${n}`;
      n += 1;
    }
    product.slug = unique;
  }

  if (req.body.variants) {
    product.variants = JSON.parse(req.body.variants);
  }

  if (req.files?.length) {
    const newImages = [];
    for (const file of req.files) {
      const uploaded = await cloudinary.uploader.upload(file.path, { folder: 'ecommerce/products' });
      fs.unlink(file.path, () => {});
      newImages.push({ url: uploaded.secure_url, public_id: uploaded.public_id });
    }
    product.images = [...product.images, ...newImages];
  }

  await product.save();
  res.json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  for (const img of product.images) {
    if (img.public_id) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (e) {
        /* ignore */
      }
    }
  }

  await Review.deleteMany({ product: product._id });
  await product.deleteOne();
  res.json({ success: true, message: 'Product removed' });
});

const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).sort('-createdAt').limit(12);
  res.json({ success: true, products });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, categories });
});

const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.json({ success: true, brands });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  createRules,
  updateProduct,
  updateRules,
  deleteProduct,
  getFeatured,
  getCategories,
  getBrands,
};
