const jwt = require('jsonwebtoken');
const { authCookieOptions } = require('../utils/cookies');

/**
 * Called after a successful Google OAuth2 callback.
 * Issues a JWT and redirects to the frontend with the token.
 */
async function googleCallbackController(req, res) {
    try {
        const user = req.user;
        // Strip trailing slashes to avoid double slashes in URL
        let origin = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL || 'http://localhost:5174';
        
        // Dynamically decode exact origin from Google's 'state' payload to prevent fallback redirects
        if (req.query.state) {
            try {
                const decodedState = JSON.parse(Buffer.from(req.query.state, 'base64').toString('ascii'));
                if (decodedState.origin) {
                    origin = decodedState.origin;
                }
            } catch (e) {
                console.error("Failed to parse state", e);
            }
        }
        
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
        res.cookie('token', token, authCookieOptions);

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
