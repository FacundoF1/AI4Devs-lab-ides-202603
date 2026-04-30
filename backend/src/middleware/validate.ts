/**
 * Generic Zod validation middleware factory.
 * Validates req.body against the provided schema before service logic runs.
 *
 * KAN-4: Data Validation — Backend validation pipe
 * KAN-7: Security — Input sanitization (trim applied via Zod schema)
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Returns an Express middleware that validates req.body with the given Zod schema.
 * On failure returns 400 with structured field-level errors.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        errors,
      });
      return;
    }
    // Replace body with parsed (trimmed/coerced) data
    req.body = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'general';
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors;
}
