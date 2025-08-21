const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const router = require("./product");
const Event = require("../model/event");
const { upload } = require("../multer");
const { isSeller } = require("../middleware/auth");
const fs = require("fs");
const path = require("path"); 

// create event
router.post(
  "/create-event",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      } else {
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);
        const eventData = req.body;
        eventData.images = imageUrls;
        eventData.shop = shop;

        const product = await Event.create(eventData);
        res.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// GET ALL EVENTS 

router.get('/get-all-events',async(req,resp,next)=>{
  try {
    const events = await Event.find();
    resp.status(201).json({
      success:true,
      events
    })
    
  } catch (error) {
    return next(new ErrorHandler(error,400))
    
  }
})

// get all event of a shop
router.get(
  "/get-all-events/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(err, 400));
    }
  })
);

// delete event of shop
router.delete(
  "/delete-shop-event/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return next(new ErrorHandler("Event not found with this ID", 404));
    }

    // Delete associated images
    if (event.images && event.images.length > 0) {
      for (let img of event.images) {
        // If images stored as filenames or objects with filename
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          img.filename || img
        );
        try {
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            console.log(`✅ Deleted file: ${filePath}`);
          }
        } catch (err) {
          console.warn(`⚠️ Failed to delete file (${filePath}):`, err.message);
        }
      }
    }

    // Delete the event from DB
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully along with images!",
    });
  })
);

module.exports = router;
