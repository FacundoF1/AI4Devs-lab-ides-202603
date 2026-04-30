/**
 * StorageService — abstraction over object storage for CV file uploads.
 *
 * KAN-5: File Upload — CV Upload Handling
 * KAN-7: Security — private bucket, UUID-prefixed keys, signed URLs
 *
 * For local development, set CV_STORAGE_PROVIDER=local to use filesystem adapter.
 * For production, set CV_STORAGE_PROVIDER=s3 (or leave unset, defaults to s3).
 *
 * Required env vars (s3 mode):
 *   CV_STORAGE_BUCKET, CV_STORAGE_REGION, CV_STORAGE_ENDPOINT (optional, for MinIO)
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *   CV_SIGNED_URL_EXPIRY_SECONDS (default: 3600)
 *   MAX_CV_FILE_SIZE_MB (default: 10)
 */
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface IStorageService {
  uploadCandidateCV(
    file: Buffer,
    originalName: string,
    candidateId: string
  ): Promise<string>;
  getSignedUrl(objectKey: string): Promise<string>;
}

// ---------------------------------------------------------------------------
// Filename sanitization — KAN-7: strip path traversal & special chars
// ---------------------------------------------------------------------------
function sanitizeFilename(name: string): string {
  return name
    .replace(/\.\.[/\\]/g, '')   // strip path traversal
    .replace(/[^a-zA-Z0-9._-]/g, '_') // keep safe chars only
    .slice(0, 100);
}

// ---------------------------------------------------------------------------
// Local filesystem adapter (development only — never use in production)
// ---------------------------------------------------------------------------
class LocalStorageAdapter implements IStorageService {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = process.env.CV_LOCAL_STORAGE_DIR ?? '/tmp/ats-cv-storage';
  }

  async uploadCandidateCV(
    file: Buffer,
    originalName: string,
    candidateId: string
  ): Promise<string> {
    const sanitized = sanitizeFilename(originalName);
    const key = `candidates/${candidateId}/cv/${uuidv4()}-${sanitized}`;
    const fullPath = path.join(this.baseDir, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file);
    // Return the object key (not a public URL)
    return key;
  }

  async getSignedUrl(objectKey: string): Promise<string> {
    // In local dev, return a simple file:// path for inspection
    return `file://${path.join(this.baseDir, objectKey)}`;
  }
}

// ---------------------------------------------------------------------------
// S3-compatible adapter (production + MinIO)
// Uses dynamic import so the package is optional in pure-local setups.
// ---------------------------------------------------------------------------
class S3StorageAdapter implements IStorageService {
  private bucket: string;
  private region: string;
  private expirySeconds: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private commands: any;

  constructor() {
    this.bucket = requireEnv('CV_STORAGE_BUCKET');
    this.region = requireEnv('CV_STORAGE_REGION');
    this.expirySeconds = parseInt(
      process.env.CV_SIGNED_URL_EXPIRY_SECONDS ?? '3600',
      10
    );
  }

  /** Lazy-init the AWS SDK client to allow the module to load without credentials in dev */
  private async getClient() {
    if (!this.client) {
      const { S3Client } = await import('@aws-sdk/client-s3');
      const { PutObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const endpoint = process.env.CV_STORAGE_ENDPOINT; // for MinIO
      this.client = new S3Client({
        region: this.region,
        ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      });
      this.commands = { PutObjectCommand, GetObjectCommand, getSignedUrl };
    }
    return this.client;
  }

  async uploadCandidateCV(
    file: Buffer,
    originalName: string,
    candidateId: string
  ): Promise<string> {
    const client = await this.getClient();
    const sanitized = sanitizeFilename(originalName);
    const key = `candidates/${candidateId}/cv/${uuidv4()}-${sanitized}`;

    const command = new this.commands.PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: detectContentType(originalName),
      ContentDisposition: `attachment; filename="${sanitized}"`,
      ServerSideEncryption: 'AES256', // SSE-S3 — KAN-7
      // ACL is intentionally omitted so bucket policy enforces private access
    });

    // Retry up to 2 times with exponential backoff for transient errors
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await client.send(command);
        return key;
      } catch (err) {
        lastError = err;
        if (attempt < 2) {
          await sleep(Math.pow(2, attempt) * 500);
        }
      }
    }
    throw lastError;
  }

  async getSignedUrl(objectKey: string): Promise<string> {
    const client = await this.getClient();
    const command = new this.commands.GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });
    return this.commands.getSignedUrl(client, command, {
      expiresIn: this.expirySeconds,
    });
  }
}

// ---------------------------------------------------------------------------
// Factory — KAN-5: swap provider via env var
// ---------------------------------------------------------------------------
export function createStorageService(): IStorageService {
  const provider = process.env.CV_STORAGE_PROVIDER ?? 's3';
  if (provider === 'local') {
    console.info('[StorageService] Using LOCAL filesystem adapter (dev only)');
    return new LocalStorageAdapter();
  }
  return new S3StorageAdapter();
}

// Singleton for use across the app
export const storageService: IStorageService = createStorageService();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

function detectContentType(filename: string): string {
  if (filename.toLowerCase().endsWith('.pdf')) return 'application/pdf';
  return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
