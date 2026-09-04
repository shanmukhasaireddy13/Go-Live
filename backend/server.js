const express = require("express");
require("dotenv").config();

const connectMongoDB = require("./config/mongodb");
const securityHeaders = require("./middleware/security");
const strictCors = require("./middleware/cors");
const apiRateLimiter = require("./middleware/rateLimiter");
const { notFoundHandler, globalErrorHandler } = require("./middleware/errorHandler");

const domainRoutes = require("./routes/domains");
const integrationRoutes = require("./routes/integrations");
const dnsRoutes = require("./routes/dns");
const authRoutes = require("./routes/auth");
const socialProofRoutes = require("./routes/socialProof");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectMongoDB();

// 1. Security Headers Middleware
app.use(securityHeaders);

// 2. Strict CORS & Body Parsers
app.use(strictCors);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 3. Rate Limiter Middleware on API
app.use("/api", apiRateLimiter);

// 4. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/dns", dnsRoutes);
app.use("/api/social-proof", socialProofRoutes);

// 5. Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "go-live-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 6. Unmatched Route & Error Handling Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✓ Go-Live Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
