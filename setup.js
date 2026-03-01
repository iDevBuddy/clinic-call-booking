// Setup script: Creates Retell AI agent + LLM with custom functions
// Run: node setup.js [server_url]
// Example: node setup.js https://clinic-call-booking.onrender.com

require("dotenv").config();
const Retell = require("retell-sdk").default || require("retell-sdk");

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// ─── Airtable: Verify table exists ──────────────────────────────
async function verifyAirtable() {
    const res = await fetch(
        `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
        { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    if (!res.ok) throw new Error(`Airtable API error: ${res.status}`);
    const data = await res.json();
    const table = data.tables?.find((t) => t.name === "Appointments");
    if (!table) throw new Error("Appointments table not found in Airtable base");
    return table;
}

// ─── Retell AI: Create LLM + Agent ────────────────────────────
async function setupRetell(serverUrl) {
    const client = new Retell({ apiKey: RETELL_API_KEY });

    // Check for existing agents first
    console.log("   Checking existing agents...");
    const existingAgents = await client.agent.list();
    const existing = existingAgents.find(
        (a) => a.agent_name === "Clinic Receptionist"
    );
    if (existing) {
        console.log(
            `   ⚠️  Agent "Clinic Receptionist" already exists (ID: ${existing.agent_id})`
        );
        console.log(`   Skipping creation. Delete it in dashboard to recreate.\n`);
        return existing;
    }

    // Step 1: Create LLM with custom functions
    console.log("   Creating LLM with custom functions...");
    const llm = await client.llm.create({
        model: "gpt-4o-mini",
        general_prompt: `You are a friendly and professional receptionist for a dental clinic.
Your job is to help patients book appointments over the phone.

Follow this conversation flow:
1. Greet the caller warmly and ask for their name
2. Ask for the reason for their visit
3. Ask what date they would like to come in. Understand natural language like "next Monday", "tomorrow", "March 5th" etc. Convert to YYYY-MM-DD format.
4. Ask what time they prefer. Convert to HH:MM 24-hour format. The clinic is open 9:00 AM to 5:00 PM.
5. Use the check_availability function to verify the slot is open
6. If available, confirm ALL details with the patient (name, date, time, reason) and ask for confirmation
7. Once confirmed, use book_appointment to book it
8. If the slot is not available, tell the patient and suggest the next available slot
9. Thank them and wish them well

Important rules:
- Always be polite, warm, and patient
- Always confirm all details before booking
- The clinic is open Monday to Friday, 9:00 AM to 5:00 PM
- Appointment slots are 30 minutes each
- If a caller asks general questions about the clinic, be helpful
- Today's date is ${new Date().toISOString().split("T")[0]}`,
        begin_message:
            "Hello! Thank you for calling our dental clinic. I'm here to help you schedule an appointment. May I have your name please?",
        general_tools: [
            {
                type: "custom",
                name: "check_availability",
                description:
                    "Check if a specific date and time slot is available for booking an appointment. Call this before booking to verify the slot is open.",
                url: serverUrl + "/retell/functions",
                speak_during_execution: true,
                speak_after_execution: true,
                parameters: {
                    type: "object",
                    properties: {
                        date: {
                            type: "string",
                            description:
                                "The date to check availability for, in YYYY-MM-DD format",
                        },
                        time: {
                            type: "string",
                            description:
                                "The preferred time to check, in HH:MM 24-hour format. Optional - if not provided, returns all available slots.",
                        },
                    },
                    required: ["date"],
                },
            },
            {
                type: "custom",
                name: "book_appointment",
                description:
                    "Book an appointment for a patient. Only call this after confirming all details with the patient and verifying availability.",
                url: serverUrl + "/retell/functions",
                speak_during_execution: true,
                speak_after_execution: true,
                parameters: {
                    type: "object",
                    properties: {
                        patient_name: {
                            type: "string",
                            description: "Full name of the patient",
                        },
                        phone: {
                            type: "string",
                            description: "Patient's phone number",
                        },
                        date: {
                            type: "string",
                            description: "Appointment date in YYYY-MM-DD format",
                        },
                        time: {
                            type: "string",
                            description: "Appointment time in HH:MM 24-hour format",
                        },
                        reason: {
                            type: "string",
                            description: "Reason for the visit",
                        },
                    },
                    required: ["patient_name", "date", "time"],
                },
            },
            {
                type: "end_call",
                name: "end_call",
                description:
                    "End the call after the appointment has been booked and confirmed, or if the caller wants to hang up.",
            },
        ],
    });
    console.log(`   ✅ LLM created: ${llm.llm_id}`);

    // Step 2: Create Agent with the LLM
    console.log("   Creating Voice Agent...");
    const agent = await client.agent.create({
        agent_name: "Clinic Receptionist",
        voice_id: "11labs-Adrian",
        response_engine: {
            type: "retell-llm",
            llm_id: llm.llm_id,
        },
        language: "en-US",
    });
    console.log(`   ✅ Agent created: ${agent.agent_id}`);

    return { llm, agent };
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
    console.log("\n🏥 Clinic Call Booking — Setup\n");
    console.log("====================================\n");

    // --- Airtable ---
    console.log("📊 AIRTABLE");
    try {
        const table = await verifyAirtable();
        console.log(`   ✅ Table found: "${table.name}"`);
        console.log(
            `   Fields: ${table.fields.map((f) => f.name).join(", ")}\n`
        );
    } catch (err) {
        console.error(`   ❌ ${err.message}\n`);
    }

    // --- Retell AI ---
    console.log("🤖 RETELL AI");
    const serverUrl = process.argv[2] || "https://YOUR-APP.onrender.com";

    if (serverUrl.includes("YOUR-APP")) {
        console.log("   ⚠️  No server URL provided.");
        console.log("   Run: node setup.js https://your-app.onrender.com\n");
        console.log("   You can also use a temporary URL for testing:");
        console.log("   Run: node setup.js http://localhost:3000\n");
    } else {
        try {
            const result = await setupRetell(serverUrl);
            if (result.agent_id) {
                console.log(`\n   Agent ID: ${result.agent_id}`);
            } else if (result.agent) {
                console.log(`\n   Agent ID: ${result.agent.agent_id}`);
                console.log(`   LLM ID:   ${result.llm.llm_id}`);
            }
            console.log(`\n   📞 Next: Go to dashboard.retellai.com`);
            console.log(`   → Assign a phone number to "Clinic Receptionist"`);
            console.log(`   → Or test with the built-in call simulator\n`);
        } catch (err) {
            console.error(`   ❌ ${err.message}\n`);
            if (err.message.includes("401") || err.message.includes("Unauthorized")) {
                console.error("   Check your RETELL_API_KEY in .env\n");
            }
        }
    }

    console.log("====================================\n");
}

main().catch(console.error);
