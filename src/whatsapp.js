// ============================================
// WhatsApp Notification Module
// ============================================
// Sends WhatsApp booking confirmations via CallMeBot (free)
//
// Setup: The recipient must first register with CallMeBot:
//   1. Add +34 644 714 572 to WhatsApp contacts
//   2. Send "I allow callmebot to send me messages" to that number
//   3. You'll receive an API key — set it as CALLMEBOT_API_KEY in env

async function sendWhatsAppConfirmation({ phone, patientName, doctor, date, time, reason }) {
    const apiKey = (process.env.CALLMEBOT_API_KEY || "").trim();
    const clinicPhone = (process.env.CALLMEBOT_PHONE || "").trim();

    if (!apiKey || !clinicPhone) {
        console.log("[WhatsApp] CALLMEBOT_API_KEY or CALLMEBOT_PHONE not set — skipping");
        return { sent: false, reason: "Not configured" };
    }

    const config = require("./config");

    // Message to clinic owner (booking notification)
    const clinicMsg = encodeURIComponent(
        `📋 *New Appointment Booked*\n\n` +
        `👤 Patient: ${patientName}\n` +
        `📞 Phone: ${phone || "Not provided"}\n` +
        `👨‍⚕️ Doctor: ${doctor || "General"}\n` +
        `📅 Date: ${date}\n` +
        `⏰ Time: ${time}\n` +
        `📝 Reason: ${reason || "General visit"}\n\n` +
        `— ${config.clinic.name}`
    );

    try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${clinicPhone}&text=${clinicMsg}&apikey=${apiKey}`;
        const res = await fetch(url);
        const text = await res.text();

        if (res.ok && text.includes("Message queued")) {
            console.log(`[WhatsApp] ✅ Notification sent to clinic (${clinicPhone})`);
            return { sent: true };
        } else {
            console.error(`[WhatsApp] ❌ Failed:`, text);
            return { sent: false, error: text };
        }
    } catch (err) {
        console.error(`[WhatsApp] ❌ Error:`, err.message);
        return { sent: false, error: err.message };
    }
}

// Send confirmation to patient's WhatsApp (patient must be registered with CallMeBot)
async function sendPatientWhatsApp({ patientPhone, patientApiKey, patientName, doctor, date, time }) {
    if (!patientApiKey || !patientPhone) return { sent: false };

    const config = require("./config");
    const msg = encodeURIComponent(
        `✅ *Appointment Confirmed*\n\n` +
        `Hi ${patientName}! Your appointment is booked:\n\n` +
        `👨‍⚕️ Doctor: ${doctor || "General"}\n` +
        `📅 Date: ${date}\n` +
        `⏰ Time: ${time}\n` +
        `📍 Location: ${config.clinic.address}\n` +
        `📞 Clinic: ${config.clinic.phone}\n\n` +
        `If you need to reschedule, please call us.\n` +
        `— ${config.clinic.name}`
    );

    try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${patientPhone}&text=${msg}&apikey=${patientApiKey}`;
        const res = await fetch(url);
        const text = await res.text();
        console.log(`[WhatsApp] Patient message:`, text.includes("queued") ? "✅ Sent" : "❌ Failed");
        return { sent: text.includes("queued") };
    } catch (err) {
        return { sent: false, error: err.message };
    }
}

module.exports = { sendWhatsAppConfirmation, sendPatientWhatsApp };
