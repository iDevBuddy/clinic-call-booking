// ============================================
// Email Confirmation Module (Gmail SMTP)
// ============================================
// Sends confirmation emails via Gmail. Works for ANY recipient email.
//
// Setup: Set these env vars:
//   GMAIL_USER = your Gmail address (e.g. iakifsaeed@gmail.com)
//   GMAIL_APP_PASSWORD = 16-char app password from Google

const nodemailer = require("nodemailer");

let _transporter = null;
function getTransporter() {
  if (!_transporter) {
    const user = (process.env.GMAIL_USER || "").trim();
    const pass = (process.env.GMAIL_APP_PASSWORD || "").trim();
    if (!user || !pass) {
      return null;
    }
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return _transporter;
}

async function sendConfirmationEmail({ patientEmail, patientName, doctor, date, time, reason }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("[Email] Gmail not configured — skipping email");
    return { sent: false, reason: "Gmail not configured" };
  }

  const config = require("./config");
  const gmailUser = (process.env.GMAIL_USER || "").trim();

  const mailOptions = {
    from: `"${config.clinic.name}" <${gmailUser}>`,
    to: patientEmail,
    bcc: gmailUser, // Clinic owner gets a copy of every confirmation
    subject: `✅ Appointment Confirmed — ${date} at ${time}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        
        <div style="background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🦷 ${config.clinic.name}</h1>
          <p style="color: #e0f2fe; margin: 8px 0 0; font-size: 14px;">Appointment Confirmation</p>
        </div>
        
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #374151;">Hello <strong>${patientName}</strong>,</p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6;">
            Your appointment has been successfully booked. Here are the details:
          </p>
          
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

          <p style="font-size: 14px; color: #6b7280;">
            To reschedule or cancel, call us at least 24 hours before your appointment.
          </p>
          
          <p style="font-size: 15px; color: #374151; margin-top: 24px;">
            We look forward to seeing you!<br>
            <strong>The ${config.clinic.name} Team</strong>
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            ${config.clinic.name} • ${config.clinic.address}
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✅ Sent to ${patientEmail} — ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email] ❌ Failed:`, err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendConfirmationEmail };
