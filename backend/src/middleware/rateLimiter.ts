/**
 * Rate limiting middleware for the candidates endpoint.
 * KAN-7: Security — max 20 req/min per authenticated user
 *
 * Rationale: Prevents abuse of the candidate creation endpoint.
 * Uses express-rate-limit with IP-based key (can be swapped to userId-based
 * when Redis is available in multi-instance deployments).
 */
import rateLimit from 'express-rate-limit';

export const candidateRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: 'Too many requests. Please try again in a minute.',
  },
});
