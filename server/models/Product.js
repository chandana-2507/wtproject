const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, trim: true, default: '' },
  color: { type: String, trim: true, default: '' },
  stock: { type: Number, default: 0, min: 0 },
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, default: '' },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    images: [imageSchema],
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    variants: [variantSchema],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
