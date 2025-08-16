const mongoose = require("mongoose");

const cuponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter Cupon Code name!"],
    unique: true,
  },
  value: {
    type: Number,
    required: true,
  },
  minAmount: {
    type: Number,
  },
  maxAmount: {
    type: Number,
  },
  shop: {
    type: Object,
    required: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Cupon", cuponSchema);
