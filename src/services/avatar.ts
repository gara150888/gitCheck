import { unlinkSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { AvatarUploadResult } from "../types";
import { AppError } from "../types";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const IMAGE_SIGNATURES: Uint8Array[] = [
  new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  new Uint8Array([0xff, 0xd8, 0xff]),
  new Uint8Array([0x47, 0x49, 0x46, 0x38]),
  new Uint8Array([0x52, 0x49, 0x46, 0x46]),
];

export function ensureUploadDir(): void {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function getExtensionForMime(mimeType: string): string | null {
  return ALLOWED_MIME_TYPES[mimeType] ?? null;
}

export function isAllowedMimeType(mimeType: string): boolean {
  return mimeType in ALLOWED_MIME_TYPES;
}

export function validateImageMagicBytes(buffer: ArrayBuffer): boolean {
  const header = new Uint8Array(buffer, 0, 8);
  return IMAGE_SIGNATURES.some((sig) =>
    sig.every((byte, i) => header[i] === byte)
  );
}

export function generateFilename(userId: number, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `user_${userId}_${timestamp}_${random}.${extension}`;
}

export function getFilePath(filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, "");
  return join(UPLOAD_DIR, safeName);
}

export async function saveAvatar(
  file: File,
  userId: number
): Promise<AvatarUploadResult> {
  ensureUploadDir();

  if (!file || file.size === 0) {
    throw new AppError(400, "No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(413, `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  if (!isAllowedMimeType(file.type)) {
    throw new AppError(415, "Unsupported file type. Allowed: PNG, JPEG, GIF, WebP");
  }

  const extension = getExtensionForMime(file.type);
  if (!extension) {
    throw new AppError(415, "Cannot determine file extension");
  }

  const buffer = await file.arrayBuffer();

  if (!validateImageMagicBytes(buffer)) {
    throw new AppError(415, "File content does not match an image type");
  }

  const filename = generateFilename(userId, extension);
  const filePath = getFilePath(filename);

  await Bun.write(filePath, Buffer.from(buffer));

  return {
    url: `/uploads/${filename}`,
    filename,
    size: file.size,
    mime_type: file.type,
  };
}

export function deleteAvatarFile(filename: string | null): boolean {
  if (!filename) return false;
  try {
    const filePath = getFilePath(filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
