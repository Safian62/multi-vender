const Shop = require("../model/shop");
const Coupon = require("../model/cupons");
const ErrorHandler = require("../utils/ErrorHandler");
const express = require("express");
const router = express.Router();
const { isSeller } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");

// CREATE A coupon CODE FOR DISCOUNT

router.post(
  "/create-coupon",
  isSeller,
  catchAsyncError(async (req, resp, next) => {
    try {
      const iscoupon = await Coupon.findOne({ name: req.body.name });
      if (iscoupon) {
        return next(new ErrorHandler("coupon Code already exists!", 400));
      }

      const coupon = await Coupon.create(req.body);
      resp.status(201).json({
        success: true,
        message: "coupon Code created Successfully.",
        coupon,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// GET ALL couponS CODE

router.get(
  "/get-coupons/:id",
  isSeller,
  catchAsyncError(async (req, resp, next) => {
    try {
      const coupons = await Coupon.find({ shop: req.params.id });
      resp.status(201).json({
        success: true,
        coupons,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

//  GET COUPN CODE VALUE BY NAME

router.get(
  "/get-coupon-value/:name",
  catchAsyncError(async (req, resp, next) => {
    try {
      const couponCode = await Coupon.findOne({ name: req.params.name });
      resp.status(201).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;
