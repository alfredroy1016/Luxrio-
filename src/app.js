const express=require('express')
const path=require('path')
require('dotenv').config()
const session=require('express-session')
const nocache=require('nocache')
const userRoute=require('./routes/user')
const app=express()


app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(nocache())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }));



  app.set('view engine',"ejs")
  app.set('views',path.join(__dirname,"views"))

  app.use("/public",express.static("public"))

  app.use('/',userRoute);

  module.exports=app





