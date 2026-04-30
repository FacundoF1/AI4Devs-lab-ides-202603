/**
 * Multer upload middleware and magic-byte MIME validation.
 *
 * KAN-5: File Upload — multer config, MIME validation
 * KAN-7: Security — reject invalid MIME types before storage
 *
 * Rationale for memoryStorage: files must never touch the local filesystem
 * before being streamed to cloud storage. diskStorage would create a TOCTOU
 * window and leave temp files if the upload fails.
 */
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const MAX_MB = parseInt(process.env.MAX_CV_FILE_SIZE_MB ?? '10', 10);
const MAX_BYTES = MAX_MB * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// Magic byte signatures for PDF and DOCX (ZIP-based)
const MAGIC_SIGNATURES: Array<{ bytes: number[]; mime: string }> = [
  { bytes: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf' }, // %PDF
  { bytes: [0x50, 0x4b, 0x03, 0x04], mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }, // PK (ZIP/DOCX)
];

/**
 * Detects MIME type from file buffer magic bytes.
 * Returns null if no known signature matches.
 */
export function detectMimeFromBuffer(buffer: Buffer): string | null {
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      return sig.mime;
    }
  }
  return null;
}

/** multer instance — memory storage, size and MIME filter applied */
export const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter(_req, file, callback) {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(`File must be PDF or DOCX, max ${MAX_MB}MB`) as unknown as null,
        false
      );
    }
  },
});

/**
 * Express middleware that validates the uploaded file's actual MIME type via
 * magic bytes, independent of the Content-Type header (which can be spoofed).
 * Must run after cvUpload middleware.
 */
export function validateFileMagicBytes(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.file) {
    // No file uploaded — that's allowed (CV is optional)
    next();
    return;
  }

  const detected = detectMimeFromBuffer(req.file.buffer);
  if (!detected || !ALLOWED_MIMES.has(detected)) {
    res.status(400).json({
      statusCode: 400,
      message: 'File content does not match an allowed type (PDF or DOCX)',
    });
    return;
  }

  // Override mimetype with the magic-byte detected value for downstream use
  req.file.mimetype = detected;
  next();
}
