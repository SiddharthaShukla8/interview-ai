const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

/** Helper — standardised JWT sign */
const signToken = (user) =>
    jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

/** Helper — standardised user payload */
const userPayload = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    picture: user.picture || null,
    authProvider: user.authProvider || 'local',
});

/**
 * @route POST /api/auth/register
 * @access Public
 */
async function registerUserController(req, res, next) {
    try {
        const { username, email, password } = req.body;

        const existing = await userModel.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'An account already exists with this email or username.',
            });
        }

        const hash = await bcrypt.hash(password, 12);
        const user = await userModel.create({ username, email, password: hash });

        const token = signToken(user);
        res.cookie('token', token, { httpOnly: false, sameSite: 'lax', maxAge: 86400000 });

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            token,
            user: userPayload(user),
        });
    } catch (err) {
        next(err);
    }
}

/**
 * @route POST /api/auth/login
 * @access Public
 */
async function loginUserController(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Google-only users have no password — prompt them to use Google
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'This account was created with Google. Please sign in with Google.',
            });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = signToken(user);
        res.cookie('token', token, { httpOnly: false, sameSite: 'lax', maxAge: 86400000 });

        res.status(200).json({
            success: true,
            message: 'Logged in successfully.',
            token,
            user: userPayload(user),
        });
    } catch (err) {
        next(err);
    }
}

/**
 * @route GET /api/auth/logout
 * @access Public
 */
async function logoutUserController(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);
        if (token) {
            await tokenBlacklistModel.create({ token });
        }
        res.clearCookie('token');
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
        next(err);
    }
}

/**
 * @route GET /api/auth/get-me
 * @access Private
 */
async function getMeController(req, res, next) {
    try {
        const user = await userModel.findById(req.user.id).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({
            success: true,
            message: 'User details fetched successfully.',
            user: userPayload(user),
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
};