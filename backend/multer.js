const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, resp, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // get extension, e.g., '.png'
    const filename = file.originalname
      .replace(ext, "")
      .replace(/\s+/g, "_"); // replace spaces with underscores
    cb(null, `${filename}_${uniqueSuffix}${ext}`);
  },
});

exports.upload = multer({ storage });
