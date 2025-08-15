const express = require("express");
const Product = require("../model/product");
const router = express.Router();
const catchAsyncError = require("../middleware/catchAsyncError");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../model/shop");

// CREATE A NEW  PRODUCT
router.post(
  "/create-product",
  upload.array("images"),
  catchAsyncError(async (req, resp, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop id is invalid", 400));
      } else {
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);
        const productData = req.body;
        productData.images = imageUrls;
        productData.shop = shop;

        const product = await Product.create(productData);
        resp.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// GET ALL PRODUCTS FOR ALL PRODUCTS
router.get(
  "/get-all-products-shop/:id",
  catchAsyncError(async (req, resp, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });
      resp.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;
