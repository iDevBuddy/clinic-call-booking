// ============================================
// Retell AI Handler Module
// ============================================
// Processes Retell AI custom function calls and webhook events

const { checkAvailability, bookAppointment } = require("./airtable");

// ─── Handle Custom Function Calls from Retell AI ─────────────────
// Retell AI sends POST requests when the agent triggers a custom function
async function handleCustomFunction(req, res) {
    const { function_name, args } = req.body;

    console.log(`[Retell] Custom function called: ${function_name}`, args);

    try {
        switch (function_name) {
            // ── Check Availability ──────────────────────────────────
            case "check_availability": {
                const { date, time } = args;

                if (!date) {
                    return res.json({
                        result: "Please provide a date to check availability.",
                    });
                }

                const result = await checkAvailability(date, time);
                console.log(`[Retell] Availability result:`, result);
                return res.json({ result: result.message });
            }

            // ── Book Appointment ────────────────────────────────────
            case "book_appointment": {
                const { patient_name, phone, date, time, reason } = args;

                if (!patient_name || !date || !time) {
                    return res.json({
                        result:
                            "I need the patient name, date, and time to book an appointment.",
                    });
                }

                const result = await bookAppointment({
                    name: patient_name,
                    phone: phone || "Not provided",
                    date,
                    time,
                    reason: reason || "General visit",
                });

                console.log(`[Retell] Booking result:`, result);
                return res.json({ result: result.message });
            }

            // ── Unknown Function ────────────────────────────────────
            default:
                console.warn(`[Retell] Unknown function: ${function_name}`);
                return res.json({
                    result: `Unknown function: ${function_name}`,
                });
        }
    } catch (error) {
        console.error(`[Retell] Error handling function ${function_name}:`, error);
        return res.json({
            result:
                "I'm sorry, there was a technical issue. Please try again or call back later.",
        });
    }
}

// ─── Handle Webhook Events from Retell AI ────────────────────────
// These fire for call lifecycle events (optional, for logging/analytics)
function handleWebhookEvent(req, res) {
    const { event, call } = req.body;

    console.log(`[Retell Webhook] Event: ${event}`);

    switch (event) {
        case "call_started":
            console.log(`[Retell] Call started — ID: ${call?.call_id}`);
            break;

        case "call_ended":
            console.log(
                `[Retell] Call ended — ID: ${call?.call_id}, Duration: ${call?.duration_ms}ms`
            );
            break;

        case "call_analyzed":
            console.log(
                `[Retell] Call analyzed — Summary: ${call?.call_analysis?.call_summary}`
            );
            break;

        default:
            console.log(`[Retell] Unhandled event: ${event}`);
    }

    // Always respond 200 to acknowledge the webhook
    return res.status(200).json({ received: true });
}

module.exports = {
    handleCustomFunction,
    handleWebhookEvent,
};
