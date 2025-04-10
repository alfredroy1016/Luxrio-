const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Listed", "Unlisted"],
    default: "Listed",
  },
  offerPrice: {
    type: Number,
    default: null, // No offer by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
