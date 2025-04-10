const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined in environment variables');
        process.exit(1);
    }

    try {
   
        console.log('Connecting to MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
       
           
        });

        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
