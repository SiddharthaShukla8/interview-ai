const { Router } = require('express');
const passport   = require('passport');
const authController = require('../controllers/auth.controller');
const { googleCallbackController } = require('../controllers/google.auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate, registerSchema, loginSchema } = require('../middlewares/validate.middleware');

const authRouter = Router();

// ── Local Auth ────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
authRouter.post('/register', validate(registerSchema), authController.registerUserController);

/**
 * POST /api/auth/login
 */
authRouter.post('/login', validate(loginSchema), authController.loginUserController);

/**
 * GET /api/auth/logout
 */
authRouter.get('/logout', authController.logoutUserController);

/**
 * GET /api/auth/get-me
 * @private
 */
authRouter.get('/get-me', authMiddleware.authUser, authController.getMeController);

// ── Google OAuth ──────────────────────────────────────────────────────────────

/**
 * GET /api/auth/google
 * Initiates Google OAuth consent screen
 */
authRouter.get(
    '/google',
    (req, res, next) => {
        // Capture the exact frontend location so we can redirect back there natively using OAuth 'state'
        let origin = req.headers.referer ? new URL(req.headers.referer).origin : (process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL || 'http://localhost:5174');
        const state = Buffer.from(JSON.stringify({ origin })).toString('base64');
        
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            prompt: 'select_account',
            state: state
        })(req, res, next);
    }
);

/**
 * GET /api/auth/google/callback
 * Google redirects here after user grants permission.
 */
authRouter.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login',
    }),
    googleCallbackController
);

module.exports = authRouter;