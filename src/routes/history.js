import express from "express";
import requireUser from "../middleware/requireUser.js";
import { getHistory } from "../services/reportHistory.js";

const router = express.Router();

router.get("/", requireUser, async (req, res) => {
  const history = await getHistory(req.user.id);
  res.json({ history });
});

export default router;
