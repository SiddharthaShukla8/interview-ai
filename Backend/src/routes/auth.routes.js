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
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',  // always show account picker
    })
);

/**
 * GET /api/auth/google/callback
 * Google redirects here after user grants permission.
 * On success → issue JWT → redirect to frontend /oauth/callback?token=...
 * On failure → redirect to frontend /login?error=google_failed
 */
authRouter.get(
    '/google/callback',
    passport.authenticate('google', {
        // Redirect to frontend on failure (don't use session:false here — let passport manage the session for this handshake)
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed`,
        failureMessage: true,
    }),
    googleCallbackController
);

module.exports = authRouter;