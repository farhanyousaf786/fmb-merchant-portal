import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { setupDatabase } from "./database/setup.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import mediaRoutes from "./routes/media.js";
import inventoryRoutes from "./routes/inventory.js";
import ordersRoutes from "./routes/orders.js";
import supportRoutes from "./routes/support.js";
import ticketsRoutes from "./routes/tickets.js";
import reviewsRoutes from "./routes/reviews.js";
import paymentRoutes from "./routes/payments.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
console.log('🚀 Loading API routes...');
app.get('/api/health', (_req, res) => res.json({ ok: true }));
console.log('✅ Health check route loaded');

app.use('/api/auth', authRoutes);
console.log('✅ Auth routes loaded');

app.use('/api/users', usersRoutes);
console.log('✅ Users routes loaded');

app.use('/api/media', mediaRoutes);
console.log('✅ Media routes loaded');

app.use('/api/inventory', inventoryRoutes);
console.log('✅ Inventory routes loaded');

app.use('/api/orders', ordersRoutes);
console.log('✅ Orders routes loaded');

app.use('/api/support', supportRoutes);
console.log('✅ Support routes loaded');

app.use('/api/tickets', ticketsRoutes);
console.log('✅ Tickets routes loaded');

app.use('/api/reviews', reviewsRoutes);
console.log('✅ Reviews routes loaded');

app.use('/api/payments', paymentRoutes);
console.log('✅ Payments routes loaded');

console.log('✅ All routes loaded successfully\n');

// Start server
async function start() {
  try {
    console.log('🔧 Setting up database...');
    await setupDatabase();
    console.log('✅ Database setup complete\n');
    
    app.listen(PORT, () => {
      console.log(`\n🎉 ========== SERVER STARTED ==========`);
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💳 Payment Routes: http://localhost:${PORT}/api/payments`);
      console.log(`✅ ========== READY FOR REQUESTS ==========\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
