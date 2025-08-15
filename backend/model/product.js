const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your product name!"],
  },
  description: {
    type: String,
    required: [true, "Please Enter your product description!"],
  },
  category: {
    type: String,
    required: [true, "Please Enter your product category!"],
  },
  tags: {
    type: String,
  },
  originalPrice: {
    type: Number,
  },
  discountPrice: {
    type: Number,
    required: [true, "Please Enter your product discount price!"],
  },
  stock: {
    type: Number,
    required: [true, "Please Enter your product Stock!"],
  },
  images: [
    {
      type: String,
    },
  ],
  shopId: {
    type: String,
    required: true,
  },
  shop: {
    type: Object,
    requied: true,
  },
  sold_out: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
module.exports = mongoose.model("Product", ProductSchema);
