
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// Basic server health
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "School Portal API is running",
    timestamp: new Date().toISOString()
  });
});

// Database readiness
router.get("/ready", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    server: "ready",
    database: databaseConnected ? "connected" : "disconnected"
  });
});

export default router;
