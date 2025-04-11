const express=require('express')
const path=require('path')
require('dotenv').config()
const session=require('express-session')
const nocache=require('nocache')
const userRoute=require('./routes/user')
const app=express()
const argon2 = require("argon2");
const flash = require("connect-flash");
const passport = require('passport');
require('./config/passport-setup');


app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json()); // for JSON data

app.use(nocache())
// const setUser = (req, res, next) => {
//   res.locals.user = req.session.user || null;
//   next();
// };

// app.use(setUser)


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }));

  app.use((req,res,next)=>{
    res.locals.session=req.session
    next();
  })

  app.use(passport.initialize());
  app.use(passport.session());

  app.set('view engine',"ejs")
  app.set('views',path.join(__dirname,"views"))

  app.use("/public",express.static("public"))


  app.use(flash());
  app.use('/',userRoute);

  module.exports=app





