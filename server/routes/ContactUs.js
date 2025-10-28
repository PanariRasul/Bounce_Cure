// server/routes/ContactUs.js
import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
 
// Check if API key exists
if (!process.env.SENDGRID_CMP_API_KEY) {
  console.error("❌ ERROR: SendGrid API key not set in environment variables.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_CMP_API_KEY);
}


router.post("/", async (req, res) => {
  try {
    const { fullname, email, phone, service, message, subscribe } = req.body;

    // Basic validation 
    if (!fullname || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Construct HTML email with better formatting
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #c2831f 0%, #d99c2b 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">📩 New Contact Form Submission</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="color: #c2831f; margin-top: 0;">Contact Details</h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 8px; background-color: #f9f9f9; font-weight: bold; width: 120px; border-radius: 4px;">Name:</td>
                        <td style="padding: 8px;">${fullname}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; background-color: #f9f9f9; font-weight: bold; border-radius: 4px;">Email:</td>
                        <td style="padding: 8px;"><a href="mailto:${email}" style="color: #c2831f; text-decoration: none;">${email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; background-color: #f9f9f9; font-weight: bold; border-radius: 4px;">Phone:</td>
                        <td style="padding: 8px;">${phone || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; background-color: #f9f9f9; font-weight: bold; border-radius: 4px;">Service:</td>
                        <td style="padding: 8px; text-transform: capitalize;">${service}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; background-color: #f9f9f9; font-weight: bold; border-radius: 4px;">Newsletter:</td>
                        <td style="padding: 8px;">${subscribe ? "✅ Subscribed" : "❌ Not subscribed"}</td>
                      </tr>
                    </table>
                    
                    <h2 style="color: #c2831f; margin-bottom: 10px;">Message</h2>
                    <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #c2831f; border-radius: 4px; white-space: pre-line; line-height: 1.6;">${message}</div>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #fff3e0; border-radius: 4px; border-left: 4px solid #c2831f;">
                      <p style="margin: 0; color: #666; font-size: 14px;">
                        <strong>Quick Action:</strong> Reply directly to <a href="mailto:${email}" style="color: #c2831f;">${email}</a>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; color: #888; font-size: 12px;">
                      This email was sent from BounceCure Contact Form<br>
                      <a href="https://bouncecure.com" style="color: #c2831f; text-decoration: none;">www.bouncecure.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
NEW CONTACT FORM SUBMISSION
===========================

Contact Details:
- Name: ${fullname}
- Email: ${email}
- Phone: ${phone || "Not provided"}
- Service: ${service}
- Newsletter: ${subscribe ? "Subscribed" : "Not subscribed"}

Message:
--------
${message}

---
Reply directly to: ${email}
Sent from BounceCure Contact Form
    `.trim();

    // SendGrid message object
    const msg = {
      to: "support@bouncecure.com",
      from: {
        email: "info@bouncecure.com", // MUST be verified in SendGrid
        name: "BounceCure Contact",
      },
      replyTo: {
        email: email,
        name: fullname
      },
      subject: `🔔 ${service.toUpperCase()} Inquiry from ${fullname}`,
      text: textContent,
      html: htmlContent,
      // Important for deliverability
      mailSettings: {
        sandboxMode: {
          enable: false // Make sure this is false in production
        }
      },
      trackingSettings: {
        clickTracking: {
          enable: true
        },
        openTracking: {
          enable: true
        }
      }
    };

    // Send email
    const response = await sgMail.send(msg);

    // === Auto-reply email to the user ===
    const autoReply = {
      to: email,
      from: {
        email: "info@bouncecure.com", // same verified sender
        name: "BounceCure Support",
      },
      subject: "Thanks for contacting BounceCure!",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #c2831f 0%, #d99c2b 100%); padding: 25px; text-align: center;">
              <h1 style="margin: 0; color: #fff; font-size: 24px;">Thank You for Reaching Out!</h1>
            </div>
            <div style="padding: 25px; color: #333;">
              <p>Hi <strong>${fullname}</strong>,</p>
              <p>We’ve received your message and our team will get back to you within <strong>one business day</strong>.</p>
              <p>Here’s a quick summary of your message:</p>
              <blockquote style="border-left: 4px solid #c2831f; margin: 15px 0; padding-left: 10px; color: #555;">
                ${message}
              </blockquote>
              <p>Meanwhile, you can learn more about us at <a href="https://bouncecure.com" style="color:#c2831f;">bouncecure.com</a>.</p>
              <p>Warm regards,<br><strong>The BounceCure Team</strong></p>
            </div>
            <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              &copy; ${new Date().getFullYear()} BounceCure. All rights reserved.
            </div>
          </div>
        </div>
      `,
    };

    await sgMail.send(autoReply);

    
    console.log(`✅ Email sent successfully from ${email} (${fullname})`);
    console.log('SendGrid Response Status:', response[0].statusCode);
    console.log('SendGrid Message ID:', response[0].headers['x-message-id']);
    
    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
      messageId: response[0].headers['x-message-id']
    });
    
  } catch (error) {
    console.error("❌ SendGrid Error:", error);

    if (error.response) {
      console.error("SendGrid Response Status:", error.response.status);
      console.error("SendGrid Response Body:", JSON.stringify(error.response.body, null, 2));
      
      const errMsg =
        error.response.body?.errors?.[0]?.message ||
        "Email service error. Please try again later.";
      
      return res.status(500).json({
        success: false,
        message: `Email service error: ${errMsg}`,
        details: error.response.body?.errors || []
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

export default router;