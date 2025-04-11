const express=require('express')
const userController=require('../controllers/user/userController')
const userRoute= express.Router()
const passport = require('passport');
const { userAuth,setUser,ifLogged,signed} = require("../middlewares/auth");

// User Routes

userRoute.get("/",userController.home)

userRoute.get("/signup",userController.loadsignup)
userRoute.post("/signup", userController.signup);

userRoute.get("/verify-otp", userController.loadVerifyOtp);
userRoute.post("/verify-otp",userController.verifyOtp);
userRoute.get("/resendOtp", userController.resendOtp);


userRoute.get("/login",userController.loadLogin);
userRoute.post("/login",userController. login);


userRoute.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

userRoute.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        failureFlash: true 
    }),
    (req, res) => {
        req.session.userId = req.user._id;
        req.session.email = req.user.email;
        req.session.isAuth = true;
        req.flash('success', 'Successfully logged in with Google!');
        console.log('User ID:', req.user._id);
        userController.home(req, res);
    }
);


userRoute.get('/shop',userController.loadShopping)

userRoute.get('/profile',userController.loadProfile)

module.exports=userRoute;