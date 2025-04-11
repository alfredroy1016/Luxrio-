const User = require("../../models/userSchema");
const argon2 = require("argon2");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const flash = require("connect-flash");

const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;





const home = async (req,res) => {
    try {
       console.log("entering the function which renders the home page");
       user: req.session.user, 
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
      req.session.signup = false;
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
    req.session.name=user.name

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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        console.log(user, "fb");
        if (user) {
          // If user exists, return user
          return done(null, user);
        } else {
          // Create new user with Google profile data
          const newUser = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "google-auth-" + Math.random().toString(36).slice(-8), // Random password for Google users
            isVerified: true, // Google users are already verified
            googleId: profile.id,
          });

          await newUser.save();

          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});




const resendOtp = async (req, res) => {
  try {
    console.log("HIT /resend-otp route");

    const resetData = req.session.passwordReset;
    console.log("Session data:", resetData);

    if (!resetData || !resetData.email) {
      return res.status(400).json({
        success: false,
        message: "Session expired. Please try again.",
      });
    }

    const newOtp = generateOtp();
    console.log("Generated OTP:", newOtp);

    const emailSent = await sendVerificationEmail(resetData.email, newOtp);
    console.log("Email sent status:", emailSent);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    req.session.passwordReset.otp = newOtp;
    req.session.passwordReset.otpExpiry = Date.now() + OTP_EXPIRY_TIME;

    res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Error resending OTP" });
  }
};

const loadShopping = async (req, res) => {
  try {
    res.render("user/shop");
  } catch (error) {
    console.error("Error loading shopping page:", error);
    res.status(500).render("error", { message: "Internal server error" });
  }
};

const loadProfile=async(req,res)=>{
  try {
    res.render("user/profile")
  } catch (error) {
    
  }
}



module.exports={
    home,
    loadsignup,
    signup,
    loadVerifyOtp,
    verifyOtp,
    loadLogin,
    login,
    resendOtp,
    loadShopping,
    loadProfile
}