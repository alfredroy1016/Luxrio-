const mongoose = require("mongoose");
const {Schema} = mongoose;




const userSchema = new Schema({
   name : {
       type:String,
       required : true
   },
   email: {
       type : String,
       required:true,
       unique: true,
   },
   phone : {
       type : String,
       required: false,
       unique: false,
   },
   password : {
       type:String,
       required :false
   },
   status: {
       type : Boolean,
       default:true
   },
   isAdmin : {
       type: Boolean,
       default:false
   },
},{timestamps:true})
  
 



const User = mongoose.model("User",userSchema);


module.exports = User;