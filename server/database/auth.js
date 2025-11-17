import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Admin login
export async function adminLogin(email, password) {
  const admin = await AdminUser.findByEmail(email);
  if (!admin) return { success: false, error: 'Invalid email or password' };

  const valid = await admin.verifyPassword(password);
  if (!valid) return { success: false, error: 'Invalid email or password' };
  if (!admin.isActive()) return { success: false, error: 'Account is inactive' };

  const token = jwt.sign({ userId: admin.id, email: admin.email, role: admin.role, userType: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

  return {
    success: true,
    token,
    user: admin.toJSON()
  };
}

// Admin register (business signup for portal)
export async function adminRegister(userData) {
  const existing = await AdminUser.findByEmail(userData.email);
  if (existing) return { success: false, error: 'Email already registered' };

  // Only allow merchant or staff from signup, default to merchant
  const rawRole = userData.role;
  const safeRole = rawRole === 'staff' ? 'staff' : 'merchant';

  const admin = await AdminUser.create({
    ...userData,
    role: safeRole,
    status: 'inactive'
  });

  return {
    success: true,
    message: 'Sign-up submitted successfully. Awaiting manual approval.',
    admin_id: admin.id
  };
}

// Get user by token (admin/staff/merchant only)
export async function getUserByToken(userId) {
  const admin = await AdminUser.findById(userId);
  return admin ? admin.toJSON() : null;
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
