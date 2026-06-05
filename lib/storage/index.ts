import path from "path";
import { randomUUID } from "crypto";

// Vercel Blob is used only when a token is configured. Otherwise files are
// persisted as bytes directly in Postgres — which works everywhere, including
// Vercel's read-only serverless filesystem (where writing to ./storage fails).
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

export interface SaveResult {
  /** Key stored on the attachment row and used in the /api/files/[key] route. */
  storageKey: string;
  /** Raw bytes to persist in the DB. Null when the file lives in Vercel Blob. */
  data: Buffer | null;
}

export const Storage = {
  async save(buffer: Buffer, fileName: string, mimeType: string): Promise<SaveResult> {
    const ext = path.extname(fileName);
    const key = `${randomUUID()}${ext}`;

    if (USE_BLOB) {
      const { put } = await import("@vercel/blob");
      const blob = await put(key, buffer, {
        access: "public",
        contentType: mimeType,
        addRandomSuffix: false,
      });
      return { storageKey: blob.pathname, data: null };
    }

    // Default: keep the bytes in the database.
    return { storageKey: key, data: buffer };
  },

  async get(key: string, dbData: Buffer | Uint8Array | null): Promise<Buffer> {
    if (dbData) return Buffer.from(dbData);

    if (USE_BLOB) {
      const { head } = await import("@vercel/blob");
      const blob = await head(key);
      const res = await fetch(blob.url);
      return Buffer.from(await res.arrayBuffer());
    }

    throw new Error("Arquivo não encontrado");
  },

  async delete(key: string, dbData: Buffer | Uint8Array | null): Promise<void> {
    if (dbData) return; // stored in DB — removed together with the row

    if (USE_BLOB) {
      const { del } = await import("@vercel/blob");
      await del(key);
    }
  },
};

// Fields safe to send to the client — everything except the raw `data` bytes.
export const attachmentSelect = {
  id: true,
  patientId: true,
  type: true,
  fileName: true,
  storageKey: true,
  mimeType: true,
  sizeBytes: true,
  uploadedAt: true,
  uploadedByUserId: true,
} as const;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
