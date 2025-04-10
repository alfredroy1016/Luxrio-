const express=require('express')
const userController=require('../controllers/user/userAuthController')
const userRoute= express.Router()




userRoute.get("/",userController.home)

userRoute.get("/login",userController.login)

userRoute.get("/signup",userController.loadsignup)

userRoute.get("Otp",userController.verifyOtp)



module.exports=userRoute;