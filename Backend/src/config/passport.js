const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const userModel = require('../models/user.model');

/**
 * Google OAuth Strategy
 * Finds or creates a user based on Google profile data.
 */
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
  process.env.NODE_ENV === "production"
    ? "https://interview-ai-backend-d3j3.onrender.com/api/auth/google/callback"
    : "http://localhost:3000/api/auth/google/callback"
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const picture = profile.photos?.[0]?.value;
                const displayName = profile.displayName || profile.name?.givenName || 'User';

                if (!email) {
                    return done(new Error('No email returned from Google'), null);
                }

                // Check if user already exists (by googleId or email)
                let user = await userModel.findOne({
                    $or: [{ googleId: profile.id }, { email }],
                });

                if (user) {
                    // Link Google account to existing user if not already linked
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.authProvider = 'google';
                    }
                    // Always update picture in case it changed
                    user.picture = picture || user.picture;
                    await user.save();
                } else {
                    // Create new Google user
                    // Generate a safe unique username from display name
                    const baseUsername = displayName
                        .replace(/[^a-zA-Z0-9]/g, '')
                        .toLowerCase()
                        .slice(0, 20);
                    const uniqueUsername = `${baseUsername}_${Date.now().toString(36)}`;

                    user = await userModel.create({
                        username: uniqueUsername,
                        email,
                        googleId: profile.id,
                        picture,
                        authProvider: 'google',
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// Passport session serialization (minimal — we primarily use JWT)
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id).lean();
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
