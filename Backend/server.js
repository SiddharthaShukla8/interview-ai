// dotenv is auto-loaded by dotenv@17+ via package.json "dotenv" field
// but we call config() explicitly for maximum compatibility
require('dotenv').config();

const app = require('./src/app');
const connectToDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// ── Startup ────────────────────────────────────────────────────────────────────
async function startServer() {
    try {
        await connectToDB();

        app.listen(PORT, () => {
            console.log('╔══════════════════════════════════════════╗');
            console.log(`║  ✅ Server running on http://localhost:${PORT}  ║`);
            console.log('║  ✅ MongoDB connected                    ║');
            console.log(`║  ✅ Google OAuth configured              ║`);
            console.log(`║  📍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}    ║`);
            console.log('╚══════════════════════════════════════════╝');
        });

    } catch (err) {
        console.error('❌ Server failed to start:', err.message);
        process.exit(1);
    }
}

// ── Unhandled rejection safety net ───────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});

startServer();