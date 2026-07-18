import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  grade: z.number().int().min(9).max(12),
  role: z.enum(['member', 'officer', 'advisor']).default('member'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  startTime: z.date(),
  endTime: z.date(),
  type: z.enum(['meeting', 'competition', 'social', 'deadline']),
}).refine(data => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const addScoreSchema = z.object({
  eventCategory: z.string().min(1, 'Please select a category'),
  scoreType: z.enum(['practice', 'competition']),
  score: z.number().min(0).max(100),
  notes: z.string().max(500).optional(),
});

export const submitVolunteerSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  hours: z.number().min(0.5).max(100),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type AddScoreFormData = z.infer<typeof addScoreSchema>;
export type SubmitVolunteerFormData = z.infer<typeof submitVolunteerSchema>;
