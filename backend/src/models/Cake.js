const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  
  flavor: {
    type: String,
    required: true
  },

  size: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  stock: {
    type: Number,
    default: 10
  }

});

const CakeSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  description: String,

  categories: [{
    type: String
  }],

  basePrice: {
    type: Number,
    required: true
  },

  variants: [variantSchema],

  specialOffer: String,

  isAvailable: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Cake", CakeSchema);