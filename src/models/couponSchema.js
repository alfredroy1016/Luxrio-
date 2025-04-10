const { name } = require('ejs');
const mongoose = require('mongoose');
const {Schema}= mongoose;

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  createOn: {
    type: Date,
    default:Date.now,
    required: true,
  },
  expiredOn: {
    type: Date,
    required: true
  },
  offerrPrice:{
    type:Number,
    required:true
  },
  minimumPrice:{
    type:Number,
    required:true
  },
  isList:{
    type:Boolean,
    default:true
  },
  userId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'User'
  }
})

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
