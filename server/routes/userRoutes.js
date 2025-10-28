import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Helper: Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/**
 * ==============================
 *  POST /api/users/signup
 * ==============================
 * Creates a new user with a free plan (50/50 email credits)
 */
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        plan: "free",
        hasPurchasedBefore: false,
        contactLimit: 50,
        emailLimit: 50,
        smsCredits: 0,
        whatsappCredits: 0,
      },
    });

    const paymentData = {
      userId: newUser.id,
      name: `${firstName} ${lastName}`,
      email: email,
      transactionId: `FREE-${Date.now()}-${newUser.id}`,
      planName: "free",
      planType: "free",
      provider: "system",
      emailVerificationCredits: 50,
      emailSendCredits: 50,
      smsCredits: 0,
      whatsappCredits: 0,
      amount: 0,
      currency: "usd",
      planPrice: 0,
      discount: 0,
      paymentMethod: "system",
      cardLast4: "",
      billingAddress: "",
      paymentDate: new Date(),
      nextPaymentDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      status: "succeeded",
    };

    await prisma.payment.create({ data: paymentData });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User created successfully with Free Plan",
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        plan: newUser.plan,
      },
      credits: {
        emailVerificationCredits: 50,
        emailSendCredits: 50,
        smsCredits: 0,
        whatsappCredits: 0,
      },
    });
  } catch (error) {
    console.error("❌ SIGNUP ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * ==============================
 *  POST /api/users/login
 * ==============================
 * Returns all credits including multimedia (SMS, WhatsApp)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    let latestPayment = await prisma.payment.findFirst({
      where: { userId: user.id, status: "succeeded" },
      orderBy: { paymentDate: "desc" },
    });

    if (!latestPayment) {
      latestPayment = await prisma.payment.create({
        data: {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          transactionId: `RESTORE-${Date.now()}`,
          planName: user.plan || "free",
          planType: user.plan || "free",
          provider: "system",
          emailVerificationCredits: user.contactLimit ?? 50,
          emailSendCredits: user.emailLimit ?? 50,
          smsCredits: user.smsCredits ?? 0,
          whatsappCredits: user.whatsappCredits ?? 0,
          amount: 0,
          currency: "usd",
          planPrice: 0,
          discount: 0,
          paymentMethod: "none",
          paymentDate: new Date(),
          nextPaymentDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 100)
          ),
          status: "succeeded",
        },
      });
      console.log(`🧾 Restored missing payment for ${user.email}`);
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: user.plan,
        hasPurchasedBefore: user.hasPurchasedBefore,
      },
      credits: {
        emailSendCredits: latestPayment.emailSendCredits ?? 0,
        emailVerificationCredits: latestPayment.emailVerificationCredits ?? 0,
        smsCredits: latestPayment.smsCredits ?? 0,
        whatsappCredits: latestPayment.whatsappCredits ?? 0,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * -------------------------
 *  GET /api/users/me
 * -------------------------
 */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User info retrieved successfully", user });
  } catch (error) {
    console.error("Fetch /me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * -------------------------
 *  GET /api/users/credits
 * -------------------------
 * ✅ Returns all credit types: Email, SMS, WhatsApp
 */
router.get("/credits", protect, async (req, res) => {
  try {
    const latestPayment = await prisma.payment.findFirst({
      where: { userId: req.user.id, status: "succeeded" },
      orderBy: { paymentDate: "desc" },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        plan: true,
        emailLimit: true,
        contactLimit: true,
        smsCredits: true,
        whatsappCredits: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      plan: user.plan,
      emailSendCredits:
        latestPayment?.emailSendCredits ?? user.emailLimit ?? 50,
      emailVerificationCredits:
        latestPayment?.emailVerificationCredits ?? user.contactLimit ?? 50,
      smsCredits: latestPayment?.smsCredits ?? user.smsCredits ?? 0,
      whatsappCredits:
        latestPayment?.whatsappCredits ?? user.whatsappCredits ?? 0,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    res.status(500).json({ error: "Failed to fetch credits" });
  }
});

/**
 * -------------------------
 *  PUT /api/users/update-credits
 * -------------------------
 * Deduct credits after campaign send
 */
router.put("/update-credits", protect, async (req, res) => {
  try {
    const { emailLimit } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { emailLimit: Number(emailLimit) },
    });

    await prisma.payment.updateMany({
      where: { userId: req.user.id },
      data: { emailSendCredits: Number(emailLimit) },
    });

    res.json({ success: true, remaining: emailLimit });
  } catch (error) {
    console.error("Update credits error:", error);
    res.status(500).json({ error: "Failed to update credits" });
  }
});

export default router;
