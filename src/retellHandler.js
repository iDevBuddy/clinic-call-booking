// ============================================
// Retell AI Handler Module
// ============================================
// Handles custom function calls and webhook events

const { checkAvailability, bookAppointment, listDoctors } = require("./airtable");
const config = require("./config");

// ─── Handle Custom Function Calls from Retell AI ─────────────────
async function handleCustomFunction(req, res) {
    // Retell sends "name" field, manual testing may use "function_name"
    const function_name = req.body.name || req.body.function_name;
    const args = req.body.args || {};

    console.log(`[Retell] Function: ${function_name}`, JSON.stringify(args));

    try {
        switch (function_name) {
            // ── List Available Doctors ─────────────────────────────
            case "list_doctors": {
                const { date } = args;
                const doctors = listDoctors(date);

                if (doctors.length === 0) {
                    return res.json({
                        result: `No doctors are available on that day. Our working days are ${config.hours.formattedHours}.`,
                    });
                }

                const doctorList = doctors
                    .map((d) => `${d.name} — ${d.specialty}`)
                    .join(". ");

                return res.json({
                    result: `Our available doctors${date ? " on that day" : ""} are: ${doctorList}. Which doctor would you prefer?`,
                });
            }

            // ── Get Clinic Info ────────────────────────────────────
            case "get_clinic_info": {
                const { question } = args;
                const info = {
                    name: config.clinic.name,
                    address: config.clinic.address,
                    phone: config.clinic.phone,
                    hours: config.hours.formattedHours,
                    services: config.services.join(", "),
                    doctors: config.doctors
                        .map((d) => `${d.name} (${d.specialty})`)
                        .join(", "),
                };

                return res.json({
                    result: `Here is our clinic information: ${config.clinic.name} is located at ${config.clinic.address}. Our phone number is ${config.clinic.phone}. We are open ${config.hours.formattedHours}. Our services include: ${config.services.slice(0, 5).join(", ")}, and more. Our doctors are: ${info.doctors}.`,
                });
            }

            // ── Check Availability ─────────────────────────────────
            case "check_availability": {
                const { date, time, doctor } = args;

                if (!date) {
                    return res.json({
                        result: "Please provide a date to check availability.",
                    });
                }

                const result = await checkAvailability(date, time, doctor);
                console.log(`[Retell] Availability:`, result.message);
                return res.json({ result: result.message });
            }

            // ── Book Appointment ───────────────────────────────────
            case "book_appointment": {
                const { patient_name, phone, email, date, time, reason, doctor } = args;

                if (!patient_name || !date || !time) {
                    return res.json({
                        result:
                            "I need the patient's name, date, and time to book an appointment. Could you please provide those details?",
                    });
                }

                const result = await bookAppointment({
                    name: patient_name,
                    phone: phone || "Not provided",
                    email: email || null,
                    date,
                    time,
                    reason: reason || "General visit",
                    doctor: doctor || null,
                });

                console.log(`[Retell] Booking:`, result.message);
                return res.json({ result: result.message });
            }

            // ── Unknown Function ───────────────────────────────────
            default:
                console.warn(`[Retell] Unknown function: ${function_name}`);
                return res.json({
                    result: `I'm sorry, I couldn't process that request. Could you please try again?`,
                });
        }
    } catch (error) {
        console.error(`[Retell] Error in ${function_name}:`, error);
        return res.json({
            result:
                "I'm sorry, there was a technical issue. Please try again or call back later.",
        });
    }
}

// ─── Handle Webhook Events ───────────────────────────────────────
function handleWebhookEvent(req, res) {
    const { event, call } = req.body;
    console.log(`[Webhook] ${event} — Call: ${call?.call_id || "unknown"}`);
    return res.status(200).json({ received: true });
}

module.exports = { handleCustomFunction, handleWebhookEvent };
