const mongoose = require("mongoose");

const connectDB = () => {
  mongoose.connect(process.env.DB_URL).then((data) => {
    console.log(`mongodb is connected with server ${data.connection.host}`);
  });
};

module.exports = connectDB;
