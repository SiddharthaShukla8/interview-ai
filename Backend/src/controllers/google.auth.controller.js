const jwt = require('jsonwebtoken');

/**
 * Called after a successful Google OAuth2 callback.
 * Issues a JWT and redirects to the frontend with the token.
 */
async function googleCallbackController(req, res) {
    try {
        const user = req.user;

        if (!user) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/oauth/callback?error=google_auth_failed`);
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set cookie for additional security
        res.cookie('token', token, {
            httpOnly: false,  // front-end needs to read it via redirect
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        // Redirect to frontend OAuth callback page with token in query param
        res.redirect(`${frontendUrl}/oauth/callback?token=${token}`);
    } catch (err) {
        console.error('Google callback error:', err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/oauth/callback?error=server_error`);
    }
}

module.exports = { googleCallbackController };
