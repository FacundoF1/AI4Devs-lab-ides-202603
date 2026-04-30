/**
 * JWT authentication and role-based authorization middleware.
 *
 * KAN-3: Backend API — Authentication & Authorization
 * KAN-7: Security — JWT validation, role guard
 *
 * Rationale: Validation is done as reusable middleware (not inline in route
 * handlers) so it can be composed and unit-tested independently.
 */
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export type UserRole = 'recruiter' | 'admin';

/** Extends Express Request with the decoded Firebase token */
export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken & { role?: UserRole };
}

/**
 * Verifies the Bearer JWT from the Authorization header using Firebase Admin SDK.
 * Sets req.user on success; returns 401 on missing/invalid/expired token.
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ statusCode: 401, message: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token, /* checkRevoked */ true);
    // Custom claims carry the role; default to 'recruiter' for backward compat
    (req as AuthRequest).user = decoded as admin.auth.DecodedIdToken & { role?: UserRole };
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token verification failed';
    res.status(401).json({ statusCode: 401, message });
  }
}

/**
 * Authorizes only users whose custom claim `role` is one of the allowed roles.
 * Must be composed after `authenticate`.
 *
 * @param allowedRoles - Roles permitted to access the route
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    // If no role claim exists, treat as recruiter (legacy tokens)
    const effectiveRole: UserRole = (role as UserRole) ?? 'recruiter';
    if (!allowedRoles.includes(effectiveRole)) {
      res.status(403).json({
        statusCode: 403,
        message: 'Insufficient permissions',
      });
      return;
    }
    next();
  };
}
