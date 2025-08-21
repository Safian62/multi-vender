const express = require("express");
const { upload } = require("../multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");

const router = express.Router();

const User = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");
const { isAuthenticated } = require("../middleware/auth");

// CREATE A USER
router.post("/create-user", upload.single("file"), async (req, resp, next) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);
    const filename = req.file?.filename;
    console.log("upload file", filename);

    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      const filename = req.file?.filename;

      if (filename) {
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
          req.file.filename
        }`;

        try {
          // Try to delete the uploaded file
          await fs.promises.unlink(filePath);
          console.log(`✅ Deleted file: ${filename}`);
        } catch (err) {
          console.error(`⚠️ Failed to delete file (${filename}):`, err.message);
          // Optional: Don't block user creation just because of file deletion failure
        }
      } else {
        console.warn("⚠️ No file found to delete.");
      }

      return next(new ErrorHandler("User already exists", 400));
    }

    const fileUrl = path.join("uploads", req.file.filename);
    const user = {
      name,
      email,
      password,
      avatar: {
        url: fileUrl,
      },
    };

    const activationToken = createActivationToken(user);
    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    await sendMail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please click the link to activate your account: ${activationUrl}`,
    });

    resp.status(201).json({
      success: true,
      message: `Please check your email (${user.email}) to activate your account.`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// CREATE ACTIVATION TOKEN
const createActivationToken = (user) => {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

// ACTIVATE OUR USER
router.post(
  "/activation",
  catchAsyncError(async (req, resp, next) => {
    const { activation_token } = req.body;

    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
    console.log("Decoded token:", newUser);

    try {
      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
      if (!newUser) {
        return next(new ErrorHandler("Invalid Token"));
      }
      const { name, email, password, avatar } = newUser;
      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorHandler("user already exists", 400));
      }

      user = await User.create({
        name,
        email,
        avatar,
        password,
      });
      sendToken(user, 201, resp);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
    console.log("Decoded activation token:", newUser);
    console.log("Token received:", activation_token);
  })
);

// LOGIN USER
router.post(
  "/login-user",
  catchAsyncError(async (req, resp, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide all feilda", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User dosn't esists!", 400));
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide correct information", 400)
        );
      }

      sendToken(user, 201, resp);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOAD USER
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return next(new ErrorHandler("User doen't exists", 400));
      }
      resp.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOGOUT METHOD
router.get(
  "/logout",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      resp.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      resp.status(201).json({
        success: true,
        message: "Logout successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER DETAILS
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide correct information", 400)
        );
      }

      user.name = name;
      user.email = email;
      user.phoneNumber = user.phoneNumber;
      await user.save();
      resp.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER AVATAR
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  catchAsyncError(async (req, resp, next) => {
    if (!req.file) {
      return next(new ErrorHandler("No file uploaded", 400));
    }

    const existsUser = await User.findById(req.user.id);

    // Delete old avatar if exists
    if (existsUser.avatar && existsUser.avatar.url) {
      const existsAvatarPath = path.join(
        __dirname,
        "..",
        existsUser.avatar.url
      );
      fs.unlink(existsAvatarPath, (err) => {
        if (err) console.log("Failed to delete old avatar:", err.message);
      });
    }

    const fileUrl = `uploads/${req.file.filename}`; // save relative path
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: { url: fileUrl } }, // save as object
      { new: true }
    );

    resp.status(200).json({ success: true, user });
  })
);

// UPDATE USER ADDRESSES
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findById(req.user.id);
      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`)
        );
      }

      const existAddress = user.addresses.find(
        (address) => address._id === req.body._id
      );
      if (existAddress) {
        Object.assign(existAddress, req.body);
      } else {
        // ADD THE NEW ADDRESS
        user.addresses.push(req.body);
      }

      await user.save();
      resp.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE USER ADDRESS
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id.replace(/^:/, "");
      await User.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } }
      );
      const user = await User.findById(userId);
      resp.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER PASSWORD

router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      isPasswordMatch = await user.comparePassword(req.body.oldPassword);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Old passord is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match!", 400));
      }

      user.password = req.body.newPassword;

      await user.save();
      resp.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
