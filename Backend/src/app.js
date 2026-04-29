const express    = require('express');
const cookieParser = require('cookie-parser');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const session    = require('express-session');
const passport   = require('./config/passport');
const errorMiddleware = require('./middlewares/error.middleware');
const { sessionCookieOptions } = require('./utils/cookies');

const app = express();

// Trust the proxy (Render, Vercel, Heroku, etc.) so we get the correct Host and Protocol
app.set('trust proxy', 1);

// ── Health Check (before any middleware — always fast) ──────────────────────
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Elevate AI Interview API',
    });
});

// ── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
// NOTE: Use a function so env vars are read at request time, not at module load
app.use(cors({
    origin: (origin, callback) => {
        const allowedUrls = [
            process.env.FRONTEND_URL,          // e.g. http://localhost:5174
            process.env.FRONTEND_URL_PROD,     // e.g. https://vercel.app
            'http://localhost:5173',
            'http://localhost:3000',
        ];
        
        // Remove undefined/null from the allowed list
        const allowed = allowedUrls.filter(Boolean);

        // Allow requests with no origin (like mobile apps, Postman)
        if (!origin) {
            console.log('[CORS] Allowed request no origin');
            return callback(null, true);
        }

        if (allowed.includes(origin)) {
            console.log(`[CORS] Allowed origin: ${origin}`);
            return callback(null, true);
        }
        
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

// ── Body / Cookie Parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Session — required for Passport OAuth handshake ──────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'elevate_session_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: sessionCookieOptions,
}));

// ── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.includes('google'), // Don't rate-limit OAuth redirects
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { success: false, message: 'Too many requests. Please slow down.' },
});
app.use(generalLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────────
const authRouter      = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/interview', interviewRouter);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.path} not found.` });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
