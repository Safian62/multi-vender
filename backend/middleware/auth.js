const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../model/user");  // Capitalized by convention
const Shop = require('../model/shop')

exports.isAuthenticated = catchAsyncError(async (req, resp, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));  // Add status code
  } 

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));  // Check if user exists
  }

  req.user = user;  // Attach user object to req

  next();
});


exports.isSeller= catchAsyncError(async (req, resp, next) => {
  const { seller_token } = req.cookies;

  if (!seller_token) {
    return next(new ErrorHandler("Please login to continue", 401));  // Add status code
  } 

  const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

  const shop = await Shop.findById(decoded.id);

  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));  // Check if user exists
  }

  req.seller = shop;  // Attach user object to req

  next();
});
