import nodemailer from 'nodemailer'

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { clientEmail, conversationSummary } = body

    if (!clientEmail) return res.status(400).json({ error: 'Missing email' })

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    })

    const clientHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#111111;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-family:monospace;color:#e05132;font-size:20px;font-weight:700;letter-spacing:2px;">DEX AUTOMATION</p>
            <p style="margin:8px 0 0;color:#666;font-size:13px;letter-spacing:1px;">by Akif Saeed</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#111;font-size:22px;font-weight:700;">Your Consultation is Confirmed ✓</h2>
            <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.7;">Thank you for your interest in DEX Automation! Our AI automation experts have received your inquiry and will contact you within <strong>24 hours</strong>.</p>
            <p style="margin:0 0 28px;color:#444;font-size:15px;line-height:1.7;">In the meantime, feel free to explore our website to learn more about how AI automation can transform your business.</p>
            <a href="https://dexakif.com" style="display:inline-block;background:#e05132;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;">Visit dexakif.com</a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background:#f9f9f9;border-top:1px solid #eee;">
            <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">Best regards,<br><strong style="color:#555;">DEX Automation Team</strong></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const notifyText = `New lead captured from website chatbot!

Email: ${clientEmail}
Time: ${new Date().toLocaleString()}

Conversation Summary:
${conversationSummary || 'No transcript available'}

Action Required: Follow up within 24 hours`

    const sends = [
        transporter.sendMail({
            from: `"DEX Automation" <${process.env.GMAIL_USER}>`,
            to: clientEmail,
            subject: 'DEX Automation — Your Consultation is Confirmed ✓',
            html: clientHtml,
        }),
    ]

    if (process.env.NOTIFY_EMAIL) {
        sends.push(
            transporter.sendMail({
                from: `"DEX Chatbot" <${process.env.GMAIL_USER}>`,
                to: process.env.NOTIFY_EMAIL,
                subject: '🔥 New Lead — DEX Website Chatbot',
                text: notifyText,
            })
        )
    }

    try {
        await Promise.all(sends)
        res.status(200).json({ success: true })
    } catch (err) {
        console.error('Email send error:', err)
        res.status(500).json({ error: 'Failed to send email' })
    }
}
