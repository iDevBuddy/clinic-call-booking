// ============================================
// Email Confirmation Module
// ============================================
// Sends appointment confirmation emails via Resend (free: 100 emails/day)

async function sendConfirmationEmail({ patientEmail, patientName, doctor, date, time, reason }) {
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    if (!apiKey) {
        console.log("[Email] RESEND_API_KEY not set — skipping email");
        return { sent: false, reason: "No API key configured" };
    }

    const config = require("./config");

    const emailBody = {
        from: "SmileCare Clinic <onboarding@resend.dev>",
        to: [patientEmail],
        subject: `✅ Appointment Confirmed — ${date} at ${time}`,
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🦷 ${config.clinic.name}</h1>
          <p style="color: #e0f2fe; margin: 8px 0 0; font-size: 14px;">Appointment Confirmation</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #374151;">Hello <strong>${patientName}</strong>,</p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6;">
            Your appointment has been successfully booked. Here are the details:
          </p>
          
          <!-- Details Card -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Date</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">⏰ Time</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">👨‍⚕️ Doctor</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${doctor || "To be assigned"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📝 Reason</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${reason || "General visit"}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            📍 <strong>Location:</strong> ${config.clinic.address}<br>
            📞 <strong>Phone:</strong> ${config.clinic.phone}
          </p>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            If you need to reschedule or cancel, please call us at least 24 hours before your appointment.
          </p>
          
          <p style="font-size: 15px; color: #374151; margin-top: 24px;">
            We look forward to seeing you!<br>
            <strong>The ${config.clinic.name} Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            ${config.clinic.name} • ${config.clinic.address}
          </p>
        </div>
      </div>
    `,
    };

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailBody),
        });

        const data = await res.json();
        if (res.ok) {
            console.log(`[Email] ✅ Confirmation sent to ${patientEmail}`, data.id);
            return { sent: true, emailId: data.id };
        } else {
            console.error(`[Email] ❌ Failed:`, data);
            return { sent: false, error: data };
        }
    } catch (err) {
        console.error(`[Email] ❌ Error:`, err.message);
        return { sent: false, error: err.message };
    }
}

module.exports = { sendConfirmationEmail };
