const express=require('express')
const userController=require('../controllers/user/userAuthController')
const userRoute= express.Router()


// User Routes

userRoute.get("/",userController.home)

userRoute.get("/signup",userController.loadsignup)
userRoute.post("/signup", userController.signup);

userRoute.get("/verify-otp", userController.loadVerifyOtp);
userRoute.post("/verify-otp",userController.verifyOtp);

userRoute.get("/login", userController.loadLogin);
userRoute.post("/login",userController. login);



module.exports=userRoute;