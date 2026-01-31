import express from "express";
import crypto from "crypto";
import supabase from "../services/supabase.js";

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["whop-signature"];
      const secret = process.env.WHOP_WEBHOOK_SECRET;

      if (!signature || !secret) {
        return res.status(400).send("Missing signature");
      }

      // 🔐 Verify signature
      const expected = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      if (signature !== expected) {
        return res.status(401).send("Invalid signature");
      }

      const event = JSON.parse(req.body.toString());

      const email = event?.data?.user?.email;
      const status = event?.data?.status; // active, cancelled, expired

      if (!email) return res.status(200).send("No user");

      // 🔁 Map status → plan
      const plan =
        status === "active" ? "pro" : "free";

      await supabase
        .from("users")
        .update({ plan })
        .eq("email", email);

      return res.json({ success: true, plan });
    } catch (err) {
      console.error("Whop webhook error:", err);
      return res.status(500).send("Webhook error");
    }
  }
);

export default router;
