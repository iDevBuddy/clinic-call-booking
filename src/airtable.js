// ============================================
// Airtable Integration Module
// ============================================
// Doctor-aware availability, appointment limits, booking with email

const Airtable = require("airtable");
const config = require("./config");
const { sendConfirmationEmail } = require("./email");

// Lazy-initialize Airtable
let _base = null;
function getBase() {
  if (!_base) {
    const apiKey = (process.env.AIRTABLE_API_KEY || "").trim();
    const baseId = (process.env.AIRTABLE_BASE_ID || "").trim();
    if (!apiKey || !baseId) {
      throw new Error("AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set");
    }
    _base = new Airtable({ apiKey }).base(baseId);
  }
  return _base;
}

const table = () =>
  getBase()((process.env.AIRTABLE_TABLE_NAME || "Appointments").trim());

// ─── Generate time slots ─────────────────────────────────────────
function generateTimeSlots() {
  const { openHour, closeHour, slotDuration } = config.hours;
  const slots = [];
  for (let hour = openHour; hour < closeHour; hour++) {
    for (let min = 0; min < 60; min += slotDuration) {
      slots.push(
        `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`
      );
    }
  }
  return slots;
}

// ─── Get day name from date ──────────────────────────────────────
function getDayName(dateStr) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date(dateStr + "T00:00:00").getDay()];
}

// ─── Get appointments for a date (optionally filtered by doctor) ─
async function getAppointmentsByDate(date, doctor) {
  let formula = `IS_SAME({Date}, '${date}', 'day')`;
  if (doctor) {
    formula = `AND(${formula}, {Doctor} = '${doctor}')`;
  }

  const records = await table()
    .select({ filterByFormula: formula })
    .all();

  return records.map((r) => ({
    id: r.id,
    name: r.fields["Patient_Name"],
    phone: r.fields["Patient_Phone"],
    email: r.fields["Patient_Email"],
    doctor: r.fields["Doctor"],
    date: r.fields["Date"],
    time: r.fields["Time"],
    status: r.fields["Status"],
    notes: r.fields["Notes"],
  }));
}

// ─── List available doctors ──────────────────────────────────────
function listDoctors(dateStr) {
  const dayName = dateStr ? getDayName(dateStr) : null;

  return config.doctors
    .filter((d) => !dayName || d.availableDays.includes(dayName))
    .map((d) => ({
      name: d.name,
      specialty: d.specialty,
      availableDays: d.availableDays.join(", "),
    }));
}

// ─── Check availability (doctor-aware + limits) ──────────────────
async function checkAvailability(date, time, doctorName) {
  const dayName = getDayName(date);

  // Check if clinic is open on this day
  if (!config.hours.workingDays.includes(dayName)) {
    return {
      available: false,
      message: `Sorry, the clinic is closed on ${dayName}s. We are open ${config.hours.formattedHours}.`,
    };
  }

  // If doctor specified, check if they work on this day
  if (doctorName) {
    const doctor = config.doctors.find(
      (d) => d.name.toLowerCase() === doctorName.toLowerCase()
    );
    if (doctor && !doctor.availableDays.includes(dayName)) {
      const availDays = doctor.availableDays.join(", ");
      return {
        available: false,
        message: `Sorry, ${doctor.name} is not available on ${dayName}s. They are available on: ${availDays}.`,
      };
    }
  }

  const appointments = await getAppointmentsByDate(date, doctorName);
  const activeAppts = appointments.filter((a) => a.status !== "Cancelled");
  const bookedTimes = activeAppts.map((a) => a.time);
  const allSlots = generateTimeSlots();

  // Check per-doctor daily limit
  if (doctorName) {
    const doctor = config.doctors.find(
      (d) => d.name.toLowerCase() === doctorName.toLowerCase()
    );
    const maxPerDay = doctor?.maxAppointmentsPerDay || config.limits.maxAppointmentsPerDoctorPerDay;
    if (activeAppts.length >= maxPerDay) {
      return {
        available: false,
        message: `Sorry, ${doctorName} is fully booked on ${date}. They have reached their maximum of ${maxPerDay} appointments for the day.`,
      };
    }
  }

  if (time) {
    const isAvailable = !bookedTimes.includes(time);
    if (isAvailable) {
      return {
        available: true, date, time, doctor: doctorName,
        message: `The slot on ${date} at ${time}${doctorName ? ` with ${doctorName}` : ""} is available.`,
      };
    }
    const nextAvailable = allSlots.find(
      (slot) => slot > time && !bookedTimes.includes(slot)
    );
    return {
      available: false, date, requestedTime: time,
      nextAvailable: nextAvailable || null,
      message: nextAvailable
        ? `Sorry, ${time} is taken${doctorName ? ` for ${doctorName}` : ""}. The next available slot is at ${nextAvailable}.`
        : `Sorry, no more slots available on ${date}${doctorName ? ` with ${doctorName}` : ""} after ${time}.`,
    };
  }

  const availableSlots = allSlots.filter((s) => !bookedTimes.includes(s));
  return {
    available: availableSlots.length > 0,
    date,
    doctor: doctorName,
    availableSlots,
    message:
      availableSlots.length > 0
        ? `Available slots on ${date}${doctorName ? ` with ${doctorName}` : ""}: ${availableSlots.join(", ")}`
        : `Sorry, no slots available on ${date}${doctorName ? ` with ${doctorName}` : ""}.`,
  };
}

// ─── Book appointment (with email + WhatsApp to customer) ────────
async function bookAppointment({ name, phone, email, date, time, reason, doctor }) {
  // Double-check availability
  const availability = await checkAvailability(date, time, doctor);
  if (!availability.available) {
    return { success: false, message: availability.message };
  }

  // Create record in Airtable (try with email field, fallback without)
  const fields = {
    Patient_Name: name,
    Patient_Phone: phone || "Not provided",
    Doctor: doctor || "General",
    Date: date,
    Time: time,
    Status: "Confirmed",
    Notes: `Reason: ${reason || "General visit"}\nEmail: ${email || "Not provided"}\nBooked via: Retell AI Call\nBooked at: ${new Date().toISOString()}`,
  };

  let record;
  try {
    // Try with Patient_Email field first
    if (email) fields["Patient_Email"] = email;
    record = await table().create([{ fields }]);
  } catch (err) {
    // If Patient_Email field doesn't exist, try without it
    if (err.message && err.message.includes("Patient_Email")) {
      console.log("[Booking] Patient_Email field not in table, storing email in Notes only");
      delete fields["Patient_Email"];
      record = await table().create([{ fields }]);
    } else {
      throw err;
    }
  }

  // Send email confirmation to CUSTOMER
  let emailResult = { sent: false };
  if (email) {
    emailResult = await sendConfirmationEmail({
      patientEmail: email,
      patientName: name,
      doctor,
      date,
      time,
      reason,
    }).catch((err) => {
      console.error("[Booking] Email to customer failed:", err);
      return { sent: false };
    });
  }

  // Send WhatsApp notification to clinic owner + customer
  const { sendWhatsAppConfirmation } = require("./whatsapp");
  sendWhatsAppConfirmation({ phone, patientName: name, doctor, date, time, reason }).catch((err) => {
    console.error("[Booking] WhatsApp failed:", err);
  });

  const doctorMsg = doctor ? ` with ${doctor}` : "";
  const emailMsg = emailResult.sent ? " A confirmation email has been sent to your email address." : "";

  return {
    success: true,
    appointmentId: record[0].id,
    message: `Appointment booked successfully for ${name} on ${date} at ${time}${doctorMsg}.${emailMsg}`,
    details: { name, phone, email, date, time, reason, doctor },
  };
}

module.exports = {
  getAppointmentsByDate,
  checkAvailability,
  bookAppointment,
  listDoctors,
  generateTimeSlots,
  getDayName,
};
