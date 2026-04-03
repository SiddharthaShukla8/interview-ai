const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, 'username already taken'],
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: [true, 'Account already exists with this email address'],
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: false,   // optional — Google users have no password
    },
    googleId: {
        type: String,
        default: null,
    },
    picture: {
        type: String,
        default: null,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
}, { timestamps: true });

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;