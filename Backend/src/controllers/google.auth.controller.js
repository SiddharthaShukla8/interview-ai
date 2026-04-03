const jwt = require('jsonwebtoken');

/**
 * Called after a successful Google OAuth2 callback.
 * Issues a JWT and redirects to the frontend with the token.
 */
async function googleCallbackController(req, res) {
    try {
        const user = req.user;
        
        // Strip trailing slashes to avoid double slashes in URL
        let origin = req.session.oauthOrigin || process.env.FRONTEND_URL || 'http://localhost:5174';
        if (origin.endsWith('/')) origin = origin.slice(0, -1);

        if (!user) {
            return res.redirect(`${origin}/oauth/callback?error=google_auth_failed`);
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

        // Redirect to frontend OAuth callback page with token in query param
        res.redirect(`${origin}/oauth/callback?token=${token}`);
    } catch (err) {
        console.error('Google callback error:', err);
        let origin = req.session?.oauthOrigin || process.env.FRONTEND_URL || 'http://localhost:5174';
        if (origin.endsWith('/')) origin = origin.slice(0, -1);
        res.redirect(`${origin}/oauth/callback?error=server_error`);
    }
}

module.exports = { googleCallbackController };
