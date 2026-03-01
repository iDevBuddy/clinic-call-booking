// ============================================
// WhatsApp Confirmation Module (Green API)
// ============================================
// Sends WhatsApp booking confirmations to customers via Green API
// Free: 720 messages/month — sends to ANY WhatsApp number
//
// Setup:
//   1. Sign up at green-api.com (free)
//   2. Create instance → scan QR with your WhatsApp
//   3. Set env vars: GREEN_API_INSTANCE_ID, GREEN_API_TOKEN

const config = require("./config");

function getGreenApiConfig() {
    const instanceId = (process.env.GREEN_API_INSTANCE_ID || "").trim();
    const token = (process.env.GREEN_API_TOKEN || "").trim();
    if (!instanceId || !token) return null;
    return { instanceId, token };
}

// Format phone number for Green API (needs: 923001234567@c.us)
function formatPhone(phone) {
    // Remove +, spaces, dashes
    let clean = phone.replace(/[\s\-\+\(\)]/g, "");
    // If starts with 0, assume Pakistan (+92)
    if (clean.startsWith("0")) clean = "92" + clean.slice(1);
    return clean + "@c.us";
}

// ─── Send WhatsApp confirmation to CUSTOMER ──────────────────────
async function sendCustomerWhatsApp({ phone, patientName, doctor, date, time, reason }) {
    const api = getGreenApiConfig();
    if (!api) {
        console.log("[WhatsApp] Green API not configured — skipping");
        return { sent: false, reason: "Not configured" };
    }

    if (!phone || phone === "Not provided") {
        console.log("[WhatsApp] No phone number — skipping");
        return { sent: false, reason: "No phone" };
    }

    const message =
        `✅ *Appointment Confirmed*\n\n` +
        `Hello ${patientName}! Your appointment has been booked:\n\n` +
        `👨‍⚕️ *Doctor:* ${doctor || "General"}\n` +
        `📅 *Date:* ${date}\n` +
        `⏰ *Time:* ${time}\n` +
        `📝 *Reason:* ${reason || "General visit"}\n\n` +
        `📍 *Location:* ${config.clinic.address}\n` +
        `📞 *Phone:* ${config.clinic.phone}\n\n` +
        `To reschedule or cancel, please call us at least 24 hours before your appointment.\n\n` +
        `— ${config.clinic.name} 🦷`;

    try {
        const url = `https://api.green-api.com/waInstance${api.instanceId}/sendMessage/${api.token}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chatId: formatPhone(phone),
                message,
            }),
        });
        const data = await res.json();

        if (data.idMessage) {
            console.log(`[WhatsApp] ✅ Confirmation sent to customer ${phone} — ID: ${data.idMessage}`);
            return { sent: true, messageId: data.idMessage };
        } else {
            console.error(`[WhatsApp] ❌ Failed:`, JSON.stringify(data));
            return { sent: false, error: data };
        }
    } catch (err) {
        console.error(`[WhatsApp] ❌ Error:`, err.message);
        return { sent: false, error: err.message };
    }
}

// ─── Send WhatsApp notification to CLINIC OWNER ──────────────────
async function sendClinicNotification({ phone, patientName, doctor, date, time, reason }) {
    const api = getGreenApiConfig();
    const clinicPhone = (process.env.CLINIC_OWNER_PHONE || "").trim();
    if (!api || !clinicPhone) return { sent: false };

    const message =
        `📋 *New Appointment Booked*\n\n` +
        `👤 *Patient:* ${patientName}\n` +
        `📞 *Phone:* ${phone || "Not provided"}\n` +
        `👨‍⚕️ *Doctor:* ${doctor || "General"}\n` +
        `📅 *Date:* ${date}\n` +
        `⏰ *Time:* ${time}\n` +
        `📝 *Reason:* ${reason || "General visit"}\n\n` +
        `— ${config.clinic.name}`;

    try {
        const url = `https://api.green-api.com/waInstance${api.instanceId}/sendMessage/${api.token}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId: formatPhone(clinicPhone), message }),
        });
        const data = await res.json();
        console.log(`[WhatsApp] Clinic notification:`, data.idMessage ? "✅ Sent" : "❌ Failed");
        return { sent: !!data.idMessage };
    } catch (err) {
        console.error(`[WhatsApp] Clinic notification error:`, err.message);
        return { sent: false };
    }
}

module.exports = { sendCustomerWhatsApp, sendClinicNotification };
