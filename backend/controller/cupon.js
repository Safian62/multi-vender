const Shop = require("../model/shop");
const Cupon = require("../model/cupons");
const ErrorHandler = require("../utils/ErrorHandler");
const express = require("express");
const router = require("./product");
const { isSeller } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");

// CREATE A CUPON CODE FOR DISCOUNT

router.post(
  "/create-cupon",
  isSeller,
  catchAsyncError(async (req, resp, next) => {
    try {
      const isCupon = await Cupon.find({ name: req.body.name });
      if (isCupon) {
        return next(new ErrorHandler("Cupon Code already exists!", 400));
      }

      const cupon = await Cupon.create(req.body);
      resp.status(201).json({
        success: true,
        message: "Cupon Code created Successfully.",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
