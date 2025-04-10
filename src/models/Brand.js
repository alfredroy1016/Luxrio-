const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Blocked'],
        default: 'Active'
    }
});

module.exports = mongoose.model('Brand', BrandSchema);
