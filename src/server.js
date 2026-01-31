import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRoute from "./routes/analyze.js";
import "./services/supabase.js";
import debugAnalyticsRoutes from "./routes/debugAnalytics.js";
import competitorsRoute from "./routes/competitors.js";
import exportRoute from "./routes/exports.js"; 
import whopWebhook from "./webhooks/whopWebhook.js";
import publicRoutes from "./routes/public.js";
import competitorsRoutes from "./routes/competitors.js";
import demoRoutes from "./routes/demo.js";
import historyRoutes from "./routes/history.js";
/*import attachUser from "./middlewares/attachUser.js"; */
import requireUser from "./middleware/requireUser.js";


console.log("Webhook import:", whopWebhook);  
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

/*app.use("/webhooks", (req, res) => {
  console.log("Whop webhook recieved");
  res.status (200).json({ recieved: true }); 
}); */

app.use(cors());
app.use(express.json());
/* app.use(attachUser);*/
app.use(requireUser);

app.use("/analyze", analyzeRoute);
app.use("/analyze", competitorsRoute);
app.use("/analyze", exportRoute);
app.use("/public", publicRoutes); 
app.use("/api", competitorsRoutes);
app.use("/demo", demoRoutes);
app.use("/history", historyRoutes);
app.use("/webhooks/whop", express.json());
app.use("/webhooks/whop", whopWebhook);

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/debug/analytics", debugAnalyticsRoutes);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
