import rateLimit from "express-rate-limit";

const publicRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many public report requests. Please try again later.",
  },
});

export default publicRateLimit;
