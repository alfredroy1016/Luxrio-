const User = require("../models/userSchema");
const flash = require("connect-flash");

/**
 * Middleware to check if the user is authenticated and not blocked.
 */
const userAuth = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.session.userId });
        console.log("User attempting access:", {
            id: user?._id,
            email: user?.email,
            isBlocked: user?.isBlocked
        });

        if (req.session.isAuth && user?.isBlocked === false) {
            next();
        } else {
            req.flash("invalidaction", "Your account has been suspended, please contact customer support");
            res.redirect("/login");
        }
    } catch (error) {
        console.log("Error in userAuth middleware:", error);
        return res.status(500).send("Internal server error");
    }
};

/**
 * Middleware to make the user session available in views.
 */
const setUser = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

/**
 * Middleware to redirect authenticated users from guest-only pages.
 */
const ifLogged = (req, res, next) => {
    try {
        if (req.session.isAuth) {
            res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        console.log("Error in ifLogged middleware:", error);
    }
};

/**
 * Middleware to protect routes after signup until OTP verification is done.
 */
const signed = (req, res, next) => {
    try {
        if (req.session.signup) {
            next();
        } else {
            req.flash("invalidaction", "Please complete signup to access this page.");
            res.redirect("/");
        }
    } catch (error) {
        console.log("Signup error:", error);
        res.status(500).send("Internal server error");
    }
};

module.exports = {
    setUser,
    userAuth,
    ifLogged,
    signed
};
