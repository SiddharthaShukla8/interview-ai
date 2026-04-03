const mongoose = require('mongoose');

async function connectToDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is not set in environment variables.');
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
        });
        // Success log is in server.js
    } catch (err) {
        throw new Error(`MongoDB connection failed: ${err.message}`);
    }
}

module.exports = connectToDB;