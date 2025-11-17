import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { setupDatabase } from "./database/setup.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);

// Start server
async function start() {
  try {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
