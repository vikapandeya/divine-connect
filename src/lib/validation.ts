import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// ── Reusable primitives ───────────────────────────────────────────────────────
const uid = z.string().min(1).max(255);
const positiveNumber = z.coerce.number().positive();
const nonNegativeNumber = z.coerce.number().min(0);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD');
const timeSlot = z.string().min(1).max(50);
const rating = z.coerce.number().int().min(1).max(5);
const phoneE164 = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

// ── Schemas ───────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(100),
  role: z.enum(['devotee', 'vendor']).default('devotee'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const bookingSchema = z.object({
  userId: uid,
  serviceId: z.union([z.string(), z.number()]),
  vendorId: z.string().max(255).optional(),
  type: z.enum(['puja', 'darshan']),
  date: isoDate,
  timeSlot: timeSlot,
  totalAmount: positiveNumber,
  isOnline: z.boolean().optional().default(false),
  bringSamagri: z.boolean().optional().default(false),
  samagriList: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional().default('pending'),
});

export const orderSchema = z.object({
  userId: uid,
  items: z.array(z.object({
    id: z.union([z.string(), z.number()]).optional(),
    productId: z.union([z.string(), z.number()]).optional(),
    name: z.string().max(255),
    price: positiveNumber,
    quantity: z.coerce.number().int().positive(),
    vendorId: z.string().optional(),
    selectedOption: z.string().optional(),
  })).min(1, 'Order must have at least one item'),
  totalAmount: positiveNumber,
  shippingAddress: z.string().min(1).max(1000),
  paymentMethod: z.enum(['stripe', 'cod', 'upi']),
  paymentId: z.string().optional(),
  paymentStatus: z.string().optional(),
  couponUsed: z.string().optional(),
  discountAmount: nonNegativeNumber.optional(),
  signatureURL: z.string().optional(),
  status: z.string().optional(),
});

export const naamJapSchema = z.object({
  userId: uid,
  date: isoDate,
  count: z.coerce.number().int().min(0),
  target: z.coerce.number().int().positive().max(10000),
  mantraName: z.string().min(1).max(255).optional(),
});

export const feedbackSchema = z.object({
  name: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  rating,
  message: z.string().min(1).max(2000),
  userId: z.string().optional(),
  serviceId: z.string().optional(),
  vendorId: z.string().optional(),
  type: z.string().optional(),
});

export const productSchema = z.object({
  vendorId: uid,
  name: z.string().min(3).max(255),
  description: z.string().max(5000).optional(),
  price: positiveNumber,
  category: z.string().max(100).optional(),
  stock: nonNegativeNumber.optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  image: z.string().optional(),
  templeName: z.string().optional(),
  weightOptions: z.any().optional(),
});

export const whatsappBookingSchema = z.object({
  userId: uid,
  vendorId: z.string().max(255).optional(),
  pujaTitle: z.string().min(1).max(255),
  whatsappNumber: phoneE164,
  userLocation: z.any().optional(),
  distance: nonNegativeNumber.optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

// ── Middleware factory ────────────────────────────────────────────────────────
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}
