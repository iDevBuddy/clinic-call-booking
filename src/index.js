// ============================================
// Clinic Call Booking Server
// ============================================
// Express server that bridges Retell AI ↔ Airtable

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { handleCustomFunction, handleWebhookEvent } = require("./retellHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Log all requests (helpful for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ─── Routes ──────────────────────────────────────────────────────

// Health check — pinged by UptimeRobot to keep Render alive
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "Clinic Call Booking System",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Retell AI Custom Functions endpoint
// This is the URL you configure in Retell AI dashboard for each custom function
app.post("/retell/functions", handleCustomFunction);

// Retell AI Webhook endpoint
// Configure this under "Webhooks" in your Retell AI agent settings
app.post("/retell/webhook", handleWebhookEvent);

// ─── Direct API endpoints (for testing without Retell) ───────────

// Check availability — GET /api/availability?date=2025-03-01&time=10:00
app.get("/api/availability", async (req, res) => {
    const { checkAvailability } = require("./airtable");
    const { date, time } = req.query;

    if (!date) {
        return res.status(400).json({ error: "date query parameter is required (YYYY-MM-DD)" });
    }

    try {
        const result = await checkAvailability(date, time);
        return res.json(result);
    } catch (error) {
        console.error("[API] Error checking availability:", error);
        return res.status(500).json({ error: "Failed to check availability" });
    }
});

// Book appointment — POST /api/book
app.post("/api/book", async (req, res) => {
    const { bookAppointment } = require("./airtable");
    const { name, phone, date, time, reason } = req.body;

    if (!name || !date || !time) {
        return res.status(400).json({
            error: "name, date, and time are required",
            example: {
                name: "John Doe",
                phone: "+1234567890",
                date: "2025-03-01",
                time: "10:00",
                reason: "Dental checkup",
            },
        });
    }

    try {
        const result = await bookAppointment({ name, phone, date, time, reason });
        return res.json(result);
    } catch (error) {
        console.error("[API] Error booking appointment:", error);
        return res.status(500).json({ error: "Failed to book appointment" });
    }
});

// ─── Start Server (only when not on Vercel) ──────────────────────
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════╗
║   Clinic Call Booking System                 ║
║   Running on port ${PORT}                        ║
╠══════════════════════════════════════════════╣
║   Endpoints:                                 ║
║   GET  /              → Health check         ║
║   POST /retell/functions → Retell functions  ║
║   POST /retell/webhook   → Retell webhooks   ║
║   GET  /api/availability → Check slots       ║
║   POST /api/book         → Book appointment  ║
╚══════════════════════════════════════════════╝
        `);
    });
}

// Export for Vercel serverless
module.exports = app;
