import express from "express";
import analyzeRouter from "./routes/analyze.js";
import debugRouter from "./routes/debug.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/analyze", analyzeRouter);
app.use("/debug", debugRouter);

export default app;
