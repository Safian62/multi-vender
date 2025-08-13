const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true }));

// CONFIG
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "backend/config/.env",
  });
}

// IMPORTS ROUTES
const user = require("./controller/user");
const shop = require("./controller/shop");
app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
//  FOR ERROR HANDLING
app.use(ErrorHandler);
module.exports = app;
