/**
 * Canonical Zod validation schema for candidate creation.
 * This is the single source of truth for field rules shared across
 * frontend and backend. Both sides import from here (or a copy is kept in sync).
 *
 * KAN-4: Data Validation — Frontend + Backend Candidate Form
 */
import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const educationEntrySchema = z.object({
  institution: z.string().max(200, 'Max 200 characters').optional(),
  degree: z.string().max(200, 'Max 200 characters').optional(),
  year: z
    .number()
    .int()
    .min(1900, 'Invalid year')
    .max(currentYear + 10, 'Invalid year')
    .optional()
    .nullable(),
});

export const workExperienceEntrySchema = z
  .object({
    company: z.string().max(200, 'Max 200 characters').optional(),
    role: z.string().max(200, 'Max 200 characters').optional(),
    startDate: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Invalid start date'
      ),
    endDate: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Invalid end date'
      ),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] }
  );

/** Backend-side schema (no File object — file validated separately via multer/magic-bytes) */
export const createCandidateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'Max 100 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Max 100 characters'),
  email: z
    .string()
    .trim()
    .email('Valid email is required')
    .max(254, 'Max 254 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-().]{7,20}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  address: z.string().trim().max(500, 'Max 500 characters').optional(),
  education: z.array(educationEntrySchema).optional(),
  workExperience: z.array(workExperienceEntrySchema).optional(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
