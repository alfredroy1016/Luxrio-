const User = require("../../models/userSchema");
const argon2 = require("argon2");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const flash = require("connect-flash");

const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const SALT_ROUNDS = 10;
const OTP_LENGTH = 6;





const home = async (req,res) => {
    try {
       console.log("entering the function which renders the home page");
       res.render('user/home') 
    } catch (error) {
        console.log("error occured while rendering the home page",error)
    }
}  



const loadsignup= async(req,res)=>{
    try {
        console.log("signup  page  success")
        res.render('user/signup')
    } catch (error) {
        console.log(error)
    }
}




const signup = async (req, res) => {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;
  
      if (password !== confirmPassword) {
        return res.status(400).json({ errors: [{ msg: "Passwords do not match" }] });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: "Email already registered" }] });
      }
  
      const otp = generateOtp();
      const emailSent = await sendVerificationEmail(email, otp);
  
      if (!emailSent) {
        return res.status(500).json({ errors: [{ msg: "Failed to send verification email" }] });
      }
  
      const hashedPassword = await argon2.hash(password);
  
      req.session.signupData = {
        name,
        email,
        phone,
        hashedPassword,
        otp,
        otpExpiry: Date.now() + OTP_EXPIRY_TIME,
      };
      req.session.signup = true;
  
      res.status(200).json({
        message: `OTP sent to ${req.session.signupData.email}`,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ errors: [{ msg: "Server error during signup" }] });
    }
  };
  

function generateOtp() {
    let otp = "";
    for (let i = 0; i < OTP_LENGTH; i++) {
      // Generate a random digit (0-9)
      otp += Math.floor(Math.random() * 10);
    }
    console.log("otp", otp);
    return otp;
  }


  async function sendVerificationEmail(email, otp) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "Verify Your Account",
        html: `
                  <h2>Account Verification</h2>
                  <p>Your verification code is: <strong>${otp}</strong></p>
                  <p>This code will expire in 10 minutes.</p>
                  <p>If you didn't request this verification, please ignore this email.</p>
              `,
      };
  
      const info = await transporter.sendMail(mailOptions);
      return info.accepted.length > 0;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
  


  const verifyOtp = async (req, res) => {
    try {
      const { otp } = req.body;
      const signupData = req.session.signupData;
  
      if (!signupData || !signupData.otp || Date.now() > signupData.otpExpiry) {
        return res.render("user/verify-otp", {
          error: "OTP expired. Please try again",
          email: signupData?.email,
        });
      }
  
      if (otp !== signupData.otp) {
        return res.render("user/verify-otp", {
          error: "Invalid OTP",
          email: signupData.email,
        });
      }

      const newUser = new User({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.hashedPassword,
      });
  
      await newUser.save();
      delete req.session.signupData;
      req.session.signup = true;
      req.session.userId = newUser._id;
      req.session.email = newUser.email;
      req.session.isAuth = true;
      res.redirect("/");
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).render("error", { message: "Error during verification" });
    }
  };
  





  const loadVerifyOtp = async (req, res) => {
    try {
      if (req.session.signupData && req.session.signup) {
        const { name, email } = req.session.signupData;
        return res.render("user/verifyOtp", {
          name,
          email,
          // otp, ❌ REMOVE THIS if it's not defined or not needed
        });
      } else {
        return res.redirect("/signup");
      }
    } catch (error) {
      console.error("Error in loadVerifyOtp:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  };
  




  const loadLogin= async(req,res)=>{
    try {
        console.log("Body check:", req.body);
console.log("Headers:", req.headers['content-type']);
        console.log("login page  success")
        res.render('user/login')
    } catch (error) {
        console.log(error)
    }
}

const login = async (req, res) => {
  try {
    console.log("entering to the user verifying upon login");
    console.log("req.body", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      console.log("Password doesn't match");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "Your account has been suspended. Contact support.",
      });
    }

    req.session.userId = user._id;
    req.session.email = user.email;
    req.session.isAuth = true;
    req.session.signup = true;

    console.log("Session set:", req.session);

    res.status(200).json({
      message: "Login successful",
      redirectUrl: user.isAdmin ? "/admin/dashboard" : "/",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports={
    home,
    loadsignup,
    signup,
    loadVerifyOtp,
    verifyOtp,
    loadLogin,
    login
}