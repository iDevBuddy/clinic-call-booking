// ============================================
// Clinic Configuration
// ============================================
// All clinic details in one place — easy to customize

const config = {
    // ─── Clinic Info ─────────────────────────────────────────────
    clinic: {
        name: (process.env.CLINIC_NAME || "SmileCare Dental Clinic").trim(),
        address: "123 Healthcare Avenue, Suite 200, Medical District",
        phone: "+1 (555) 123-4567",
        email: "appointments@smilecare-dental.com",
        website: "www.smilecare-dental.com",
        description:
            "SmileCare Dental Clinic is a modern dental practice offering comprehensive dental care including general dentistry, orthodontics, cosmetic procedures, and oral surgery. We prioritize patient comfort and use the latest technology.",
    },

    // ─── Operating Hours ─────────────────────────────────────────
    hours: {
        openHour: parseInt((process.env.CLINIC_OPEN_HOUR || "9").trim(), 10),
        closeHour: parseInt((process.env.CLINIC_CLOSE_HOUR || "17").trim(), 10),
        slotDuration: parseInt((process.env.APPOINTMENT_DURATION || "30").trim(), 10),
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        closedDays: ["Saturday", "Sunday"],
        formattedHours: "Monday–Friday, 9:00 AM – 5:00 PM",
    },

    // ─── Doctors ─────────────────────────────────────────────────
    doctors: [
        {
            name: "Dr. Ahmed Khan",
            specialty: "General Dentistry",
            availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            maxAppointmentsPerDay: 8,
        },
        {
            name: "Dr. Sara Malik",
            specialty: "Orthodontics",
            availableDays: ["Monday", "Wednesday", "Friday"],
            maxAppointmentsPerDay: 6,
        },
        {
            name: "Dr. James Wilson",
            specialty: "Cosmetic Dentistry",
            availableDays: ["Tuesday", "Thursday", "Friday"],
            maxAppointmentsPerDay: 6,
        },
        {
            name: "Dr. Fatima Noor",
            specialty: "Oral Surgery",
            availableDays: ["Monday", "Tuesday", "Thursday"],
            maxAppointmentsPerDay: 4,
        },
    ],

    // ─── Services ────────────────────────────────────────────────
    services: [
        "General Checkup & Cleaning",
        "Teeth Whitening",
        "Dental Fillings",
        "Root Canal Treatment",
        "Braces & Invisalign",
        "Dental Implants",
        "Tooth Extraction",
        "Wisdom Teeth Removal",
        "Veneers & Crowns",
        "Emergency Dental Care",
    ],

    // ─── Appointment Limits ──────────────────────────────────────
    limits: {
        maxAppointmentsPerSlot: 1, // 1 patient per time slot per doctor
        maxAppointmentsPerDoctorPerDay: 8, // default, overridden per doctor
        maxFutureBookingDays: 60, // can book up to 60 days ahead
    },
};

module.exports = config;
