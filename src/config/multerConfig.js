const multer = require('multer');
const path = require('path');

// Multer storage settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/brands/'); // Save images here
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// File Filter (Allow only images)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);
    
    isValid ? cb(null, true) : cb(new Error('Only image files are allowed!'));
};

// Multer instance
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});

module.exports = upload;
