// ============================================
// Airtable Integration Module
// ============================================
// Handles all Airtable operations: querying slots, booking appointments
//
// Airtable table schema (existing):
//   Patient_Name  — singleLineText
//   Patient_Phone — singleLineText
//   Doctor        — singleLineText
//   Date          — date (YYYY-MM-DD)
//   Time          — singleLineText (HH:MM)
//   Status        — singleSelect (Confirmed, Cancelled)
//   Notes         — multilineText

const Airtable = require("airtable");

// Lazy-initialize Airtable (avoids crash if env vars not set yet)
let _base = null;
function getBase() {
  if (!_base) {
    const apiKey = (process.env.AIRTABLE_API_KEY || "").trim();
    const baseId = (process.env.AIRTABLE_BASE_ID || "").trim();
    if (!apiKey || !baseId) {
      throw new Error(
        "AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in environment variables"
      );
    }
    _base = new Airtable({ apiKey }).base(baseId);
  }
  return _base;
}

const table = () => getBase()((process.env.AIRTABLE_TABLE_NAME || "Appointments").trim());

// ─── Helper: Generate time slots for a day ───────────────────────
function generateTimeSlots() {
  const openHour = parseInt(process.env.CLINIC_OPEN_HOUR || "9", 10);
  const closeHour = parseInt(process.env.CLINIC_CLOSE_HOUR || "17", 10);
  const duration = parseInt(process.env.APPOINTMENT_DURATION || "30", 10);

  const slots = [];
  for (let hour = openHour; hour < closeHour; hour++) {
    for (let min = 0; min < 60; min += duration) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(min).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

// ─── Get all appointments for a specific date ────────────────────
async function getAppointmentsByDate(date) {
  // date format: "YYYY-MM-DD"
  const records = await table()
    .select({
      filterByFormula: `IS_SAME({Date}, '${date}', 'day')`,
    })
    .all();

  return records.map((r) => ({
    id: r.id,
    name: r.fields["Patient_Name"],
    phone: r.fields["Patient_Phone"],
    doctor: r.fields["Doctor"],
    date: r.fields["Date"],
    time: r.fields["Time"],
    status: r.fields["Status"],
    notes: r.fields["Notes"],
  }));
}

// ─── Check availability for a specific date and time ─────────────
async function checkAvailability(date, time) {
  const appointments = await getAppointmentsByDate(date);
  const bookedTimes = appointments
    .filter((a) => a.status !== "Cancelled")
    .map((a) => a.time);

  const allSlots = generateTimeSlots();

  // If a specific time was requested, check that slot
  if (time) {
    const isAvailable = !bookedTimes.includes(time);
    if (isAvailable) {
      return {
        available: true,
        date,
        time,
        message: `The slot on ${date} at ${time} is available.`,
      };
    }
    // Find next available slot on the same day
    const nextAvailable = allSlots.find(
      (slot) => slot > time && !bookedTimes.includes(slot)
    );
    return {
      available: false,
      date,
      requestedTime: time,
      nextAvailable: nextAvailable || null,
      message: nextAvailable
        ? `Sorry, ${time} is taken. The next available slot is at ${nextAvailable}.`
        : `Sorry, no more slots available on ${date} after ${time}.`,
    };
  }

  // No specific time — return all available slots
  const availableSlots = allSlots.filter(
    (slot) => !bookedTimes.includes(slot)
  );
  return {
    available: availableSlots.length > 0,
    date,
    availableSlots,
    message:
      availableSlots.length > 0
        ? `Available slots on ${date}: ${availableSlots.join(", ")}`
        : `Sorry, no slots available on ${date}.`,
  };
}

// ─── Book an appointment ─────────────────────────────────────────
async function bookAppointment({ name, phone, date, time, reason, doctor }) {
  // Double-check availability before booking
  const availability = await checkAvailability(date, time);
  if (!availability.available) {
    return {
      success: false,
      message: availability.message,
    };
  }

  // Create record in Airtable (matches existing schema)
  const record = await table().create([
    {
      fields: {
        "Patient_Name": name,
        "Patient_Phone": phone || "Not provided",
        "Doctor": doctor || "General",
        "Date": date,           // YYYY-MM-DD format for date field
        "Time": time,
        "Status": "Confirmed",
        "Notes": `Reason: ${reason || "General visit"}\nBooked via: Retell AI Call\nBooked at: ${new Date().toISOString()}`,
      },
    },
  ]);

  return {
    success: true,
    appointmentId: record[0].id,
    message: `Appointment booked successfully for ${name} on ${date} at ${time}.`,
    details: {
      name,
      phone,
      date,
      time,
      reason,
    },
  };
}

module.exports = {
  getAppointmentsByDate,
  checkAvailability,
  bookAppointment,
  generateTimeSlots,
};
