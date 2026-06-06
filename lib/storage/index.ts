import path from "path";
import { randomUUID } from "crypto";

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

export interface SaveResult {
  storageKey: string;
  data: Buffer | null;
  blobUrl: string | null;
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
      return { storageKey: blob.pathname, data: null, blobUrl: blob.url };
    }

    // Default: persist bytes in Postgres — works on Vercel's read-only filesystem
    return { storageKey: key, data: buffer, blobUrl: null };
  },

  async get(
    key: string,
    dbData?: Buffer | Uint8Array | null,
    blobUrl?: string | null,
  ): Promise<Buffer> {
    if (dbData) return Buffer.from(dbData);
    if (blobUrl) {
      const res = await fetch(blobUrl);
      if (!res.ok) throw new Error("Blob fetch failed");
      return Buffer.from(await res.arrayBuffer());
    }
    throw new Error("Arquivo não encontrado");
  },

  async delete(
    key: string,
    dbData?: Buffer | Uint8Array | null,
    blobUrl?: string | null,
  ): Promise<void> {
    if (dbData) return; // row deletion removes the bytes
    if (blobUrl) {
      const { del } = await import("@vercel/blob");
      await del(blobUrl);
    }
  },
};

// Fields safe to send to the client — excludes raw bytes and internal Blob URL
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
