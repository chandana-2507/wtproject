import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
});

export const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(5),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(1, 'Review text required'),
});
