import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const STORAGE_BASE = process.env.STORAGE_PATH || "./storage";

export const Storage = {
  async save(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const ext = path.extname(fileName);
    const key = `${randomUUID()}${ext}`;

    if (USE_BLOB) {
      const { put } = await import("@vercel/blob");
      await put(key, buffer, { access: "public", contentType: mimeType });
      // key is the blob url path segment; we store it as-is and use it to download
    } else {
      const dir = path.resolve(STORAGE_BASE);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, key), buffer);
    }

    return key;
  },

  async get(key: string): Promise<Buffer> {
    if (USE_BLOB) {
      const { head } = await import("@vercel/blob");
      const blob = await head(key);
      const res = await fetch(blob.url);
      return Buffer.from(await res.arrayBuffer());
    }
    const filePath = path.resolve(STORAGE_BASE, key);
    if (!filePath.startsWith(path.resolve(STORAGE_BASE))) throw new Error("Invalid key");
    return fs.readFile(filePath);
  },

  async delete(key: string): Promise<void> {
    if (USE_BLOB) {
      const { del } = await import("@vercel/blob");
      await del(key);
      return;
    }
    const filePath = path.resolve(STORAGE_BASE, key);
    if (!filePath.startsWith(path.resolve(STORAGE_BASE))) throw new Error("Invalid key");
    await fs.unlink(filePath);
  },
};

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
