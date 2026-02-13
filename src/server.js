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
  origin: [
    "http://localhost:3000",
    "https://brandanalyzer.lovable.app",
  ],
}));

/*app.use("/webhooks", (req, res) => {
  console.log("Whop webhook recieved");
  res.status (200).json({ recieved: true }); 
}); */

import "dotenv/config";
import express from "express";
import cors from "cors";

import analyzeRoute from "./routes/analyze.js";
import debugAnalyticsRoutes from "./routes/debugAnalytics.js";
import competitorsRoute from "./routes/competitors.js";
import exportRoute from "./routes/exports.js";
import publicRoutes from "./routes/public.js";
import demoRoutes from "./routes/demo.js";
import historyRoutes from "./routes/history.js";
import whopWebhook from "./webhooks/whopWebhook.js";
import "./services/supabase.js";

const app = express();

const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://brandanalyzer.lovable.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Health endpoints
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Brand Analyzer API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Routes
app.use("/", publicRoutes);
app.use("/analyze", analyzeRoute);
app.use("/competitors", competitorsRoute);
app.use("/exports", exportRoute);
app.use("/demo", demoRoutes);
app.use("/history", historyRoutes);
app.use("/debug/analytics", debugAnalyticsRoutes);

// Webhooks (use raw JSON parser for webhook endpoint)
app.use("/webhooks/whop", express.json(), whopWebhook);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${PORT}`);
});