// server/routes/stripe.js
import express from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendInvoiceEmail } from "../config/sendgrid.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { generatePrintingInvoice } from "../utils/printInvoiceGen.js";
import { invoiceEmailTemplate } from "../utils/invoiceEmailTemplate.js";
import cron from "node-cron";  // 🕒 Add this line

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();
 
// Check Stripe secret key validity on server start
stripe.customers.list({ limit: 1 })
  .then(() => console.log('✅ Stripe SECRET key is valid'))
  .catch(err => console.error('❌ Stripe SECRET key error:', err.message));
 
/**
 * Utility: Get next payment date from plan type
 */
/**
 * 🧮 Utility: Get next payment date based on plan type
 * Supports: monthly (30 days), quarterly (90 days), yearly (365 days)
 */
export const getNextPaymentDate = (currentDate, planType) => {
  const date = new Date(currentDate);
  const normalized = planType?.toLowerCase() || "";

  if (["month", "monthly"].includes(normalized)) {
    date.setDate(date.getDate() + 30);
  } else if (["quarter", "quarterly"].includes(normalized)) {
    date.setDate(date.getDate() + 90);
  } else if (["year", "yearly", "annual", "annually"].includes(normalized)) {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    console.warn(`⚠️ Unknown planType "${planType}", defaulting to +30 days`);
    date.setDate(date.getDate() + 30);
  }

  return date.toISOString();
};

 
 
/**
 * Create Stripe Payment Intent
 */
router.post("/create-payment-intent", async (req, res) => {
  const { amount, email, planName, planType, currency = "usd" } = req.body;
 
  if (!amount || !email) {
    return res.status(400).json({ error: "Amount and email are required" });
  }
 
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      receipt_email: email,
      description: `${planName || "Subscription"} for ${email}`,
      payment_method_types: ["card"],
    });
 
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      transactionId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});
 
/**
 * Save Payment + Generate & Email Invoice
 */
// ✅ Save Payment + Generate & Email Invoice

// Updated /api/stripe/save-payment endpoint - stripe.js
// Replace the entire endpoint (around line 85-250)

router.post("/save-payment", async (req, res) => {
  try {
    const {
      name,
      amount,
      discount,
      planPrice,
      paymentDate,
      billingAddress,
      planName,
      planType,
      email,
      transactionId,
      userId,
      provider,
      currency,
      paymentMethod,
      cardLast4,
      status,

      // ✅ ALL credit types from frontend
      emailVerificationCredits,
      emailSendCredits,
      smsCredits,
      whatsappCredits,
    } = req.body;

    console.log("📥 Received payment data:", {
      userId,
      planName,
      planType,
      emailVerificationCredits,
      emailSendCredits,
      smsCredits,
      whatsappCredits,
    });

    if (!name || !planName || !email || !transactionId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();

    // ✅ Normalize plan type for SMS / WhatsApp / Email
    let normalizedPlanType = planType?.toLowerCase() || "";
    const lowerPlanName = planName?.toLowerCase() || "";
    if (lowerPlanName.includes("sms")) normalizedPlanType = "sms";
    else if (lowerPlanName.includes("whatsapp")) normalizedPlanType = "whatsapp";
    else if (lowerPlanName.includes("email")) normalizedPlanType = "email";
    const nextPaymentDate = getNextPaymentDate(paymentDateObj, normalizedPlanType);

    // 🧩 Validate user
    const user = await prisma.user.findUnique({ where: { id: userIdInt } });
    if (!user) {
      return res.status(400).json({ error: `User with ID ${userIdInt} not found` });
    }

    console.log("👤 Current user credits:", {
      contactLimit: user.contactLimit,
      emailLimit: user.emailLimit,
      smsCredits: user.smsCredits,
      whatsappCredits: user.whatsappCredits,
    });

    // ✅ Compute final credits
    const finalEmailVerificationCredits = Number(emailVerificationCredits || 0);
    const finalEmailSendCredits = Number(emailSendCredits || 0);
    const finalSmsCredits = Number(smsCredits || 0);
    const finalWhatsappCredits = Number(whatsappCredits || 0);

    console.log("💳 Final Credit Breakdown:", {
      finalEmailVerificationCredits,
      finalEmailSendCredits,
      finalSmsCredits,
      finalWhatsappCredits,
    });

    // 💾 Build payment object
    const paymentData = {
      userId: userIdInt,
      name,
      email,
      transactionId,
      planName: lowerPlanName,
      planType: normalizedPlanType,
      provider: provider || "system",
      emailVerificationCredits: finalEmailVerificationCredits,
      emailSendCredits: finalEmailSendCredits,
      smsCredits: finalSmsCredits,
      whatsappCredits: finalWhatsappCredits,
      amount: lowerPlanName === "free" ? 0 : Number(amount),
      currency: currency || "usd",
      planPrice: lowerPlanName === "free" ? 0 : Number(planPrice) || Number(amount),
      discount: Number(discount) || 0,
      paymentMethod: lowerPlanName === "free" ? "system" : (paymentMethod || "card"),
      cardLast4: cardLast4 || "",
      billingAddress: billingAddress || "",
      paymentDate: paymentDateObj,
      nextPaymentDate: new Date(nextPaymentDate),
      status: status || "succeeded",
    };

    // ✅ Save payment in DB
    const payment = await prisma.payment.create({ data: paymentData });
    console.log("✅ Payment saved to DB:", payment.id);

    // ✅ Update user credits dynamically (always add to existing)
    const updatedUserData = {
      plan: lowerPlanName,
      hasPurchasedBefore: true,
      contactLimit: (user.contactLimit || 0) + finalEmailVerificationCredits,
      emailLimit: (user.emailLimit || 0) + finalEmailSendCredits,
      smsCredits: (user.smsCredits || 0) + finalSmsCredits,
      whatsappCredits: (user.whatsappCredits || 0) + finalWhatsappCredits,
    };

    console.log("📝 Updating user:", updatedUserData);

    const updatedUser = await prisma.user.update({
      where: { id: userIdInt },
      data: updatedUserData,
    });

    console.log("✅ User updated:", {
      id: updatedUser.id,
      smsCredits: updatedUser.smsCredits,
      whatsappCredits: updatedUser.whatsappCredits,
    });

    // 🧾 Generate and send invoice
    try {
      const pdfBuffer = await generateInvoice(payment);
      const pdfBuffers = await generatePrintingInvoice(payment);

      const html = invoiceEmailTemplate({
        transactionId: payment.transactionId,
        planName: payment.planName,
        total: payment.amount,
        currency: payment.currency?.toUpperCase() || "USD",
      });

      await sendInvoiceEmail({
        to: payment.email,
        subject: `Invoice ${payment.transactionId} - ${payment.planName}`,
        html,
        pdfBuffer,
        pdfBuffers,
        fileName: `invoice-${payment.transactionId}.pdf`,
      });
      console.log("✅ Invoice sent successfully");
    } catch (invoiceError) {
      console.error("⚠️ Invoice generation/sending failed:", invoiceError);
    }

    // ✅ Respond success
    res.json({
      success: true,
      message: "Payment and user credits saved successfully",
      payment,
      updatedUser,
    });
  } catch (err) {
    console.error("❌ Error saving payment:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🕒 Every midnight, check and expire outdated plans
cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Running daily plan expiry check...");

  const now = new Date();

  try {
    // Find expired users
    const expiredUsers = await prisma.payment.findMany({
      where: {
        nextPaymentDate: { lt: now },
        status: "succeeded",
      },
      include: { user: true },
    });

    for (const record of expiredUsers) {
      // Reset user's credits
      await prisma.user.update({
        where: { id: record.userId },
        data: {
          emailLimit: 0,
          contactLimit: 0,
          plan: "Expired",
        },
      });

      // Mark payment as expired
      await prisma.payment.update({
        where: { id: record.id },
        data: { status: "expired" },
      });

      console.log(`🚫 Expired plan for user ${record.userId}`);
    }

    console.log(`✅ Plan expiry check completed (${expiredUsers.length} users updated).`);
  } catch (err) {
    console.error("❌ Error running expiry check:", err);
  }
});

export default router;


