// server/routes/settingsRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";
import { protect } from "../middleware/authMiddleware.js";
import { sendNotification } from "../services/notificationService.js";

const router = express.Router();
const prisma = new PrismaClient();

//
// ---------------- Notification Settings ----------------
//
const notifSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  inApp: z.boolean().optional(), // ✅ match frontend
  frequency: z.enum(["instant", "daily", "weekly"]),
});

router.use(protect);

// ✅ Get notification settings
router.get("/notifications", async (req, res) => {
  try {
    const userId = req.user.id;

    let setting = await prisma.notificationSetting.findUnique({ where: { userId } });

    if (!setting) {
      // return default if none
      setting = { email: true, sms: false, push: false, inApp: false, frequency: "daily" };
    }

    res.json(setting);
  } catch (err) {
    console.error("GET /notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notification settings" });
  }
});

// ✅ Update notification settings
router.put("/notifications", async (req, res) => {
  try {
    const parsed = notifSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const userId = req.user.id;

    const saved = await prisma.notificationSetting.upsert({
      where: { userId },
      update: parsed.data,
      create: { userId, ...parsed.data },
    });

    res.json(saved);
  } catch (err) {
    console.error("PUT /notifications error:", err);
    res.status(500).json({ error: "Failed to update notification settings" });
  }
});

//
// ---------------- API Keys ----------------
//
function generateKey() {
  return "sk-" + crypto.randomBytes(20).toString("hex");
}
function maskKey(k) {
  return k.slice(0, 6) + "..." + k.slice(-4);
}

// ✅ Get API keys
router.get("/apikeys", async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(keys.map(k => ({ ...k, value: maskKey(k.key) })));
  } catch (err) {
    console.error("GET /apikeys error:", err);
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

// ✅ Create API key
router.post("/apikeys", async (req, res) => {
  try {
    const userId = req.user.id;
    const name = (req.body?.name || "New Key").toString().slice(0, 64);
    const value = generateKey();

    const created = await prisma.apiKey.create({
      data: { name, key: value, userId },
    });

    await sendNotification(userId, {
      subject: "New API Key Created",
      message: `Your API key "${name}" was created successfully.`,
    });

    res.status(201).json({ ...created, value }); // show full key once
  } catch (err) {
    console.error("POST /apikeys error:", err);
    res.status(500).json({ error: "Failed to create API key" });
  }
});

// ✅ Revoke API key
router.delete("/apikeys/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const existing = await prisma.apiKey.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Key not found" });

    await prisma.apiKey.update({ where: { id }, data: { revoked: true } });

    await sendNotification(userId, {
      subject: "API Key Revoked",
      message: `Your API key "${existing.name}" has been revoked.`,
    });

    res.json({ message: "Key revoked" });
  } catch (err) {
    console.error("DELETE /apikeys/:id error:", err);
    res.status(500).json({ error: "Failed to revoke API key" });
  }
});

//
// ---------------- Push Subscription ----------------
//
router.post("/push-subscribe", async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ error: "Subscription is required" });

    await prisma.pushSubscription.upsert({
      where: { userId: req.user.id },
      update: { subscription: JSON.stringify(subscription) },
      create: { userId: req.user.id, subscription: JSON.stringify(subscription) },
    });

    res.json({ message: "Push subscription saved" });
  } catch (err) {
    console.error("POST /push-subscribe error:", err);
    res.status(500).json({ error: "Failed to save push subscription" });
  }
});

//
// ---------------- Danger Zone (Delete Account) ----------------
//
router.delete("/delete-account", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userEmail = user.email;

    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({ where: { userId } });
      await tx.apiKey.deleteMany({ where: { userId } });
      await tx.notificationSetting.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.loginLog.deleteMany({ where: { userId } });
      await tx.oTPCode.deleteMany({ where: { userId } });
      await tx.content.deleteMany({ where: { createdBy: userId } });

      // Record deleted user
      await tx.deletedAccount.create({ data: { userEmail } });

      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("DELETE /delete-account error:", err);
    res.status(500).json({ error: err.message || "Failed to delete account" });
  }
});


export default router;
