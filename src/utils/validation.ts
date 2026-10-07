import { AppError } from "../types";

export function parseIdParam(params: Record<string, string>, key: string): number {
  const raw = params[key];
  if (!raw) {
    throw new AppError(400, `Missing '${key}' parameter`);
  }
  const id = Number.parseInt(raw, 10);
  if (Number.isNaN(id) || id <= 0) {
    throw new AppError(400, `Invalid '${key}': ${raw}`);
  }
  return id;
}

export const MAX_NAME_LENGTH = 100;
export const MAX_BIO_LENGTH = 500;
export const MAX_EMAIL_LENGTH = 255;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  if (email.length > MAX_EMAIL_LENGTH) return false;
  return EMAIL_REGEX.test(email);
}

export function sanitizeString(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateName(name: string): string {
  if (!name || typeof name !== "string") {
    throw new Error("Name is required");
  }
  const sanitized = sanitizeString(name);
  if (!sanitized) {
    throw new Error("Name is required");
  }
  if (sanitized.length > MAX_NAME_LENGTH) {
    throw new Error(`Name must be at most ${MAX_NAME_LENGTH} characters`);
  }
  return sanitized;
}

export function validateBio(bio: string | null | undefined): string | null {
  const sanitized = sanitizeString(bio);
  if (sanitized && sanitized.length > MAX_BIO_LENGTH) {
    throw new Error(`Bio must be at most ${MAX_BIO_LENGTH} characters`);
  }
  return sanitized;
}

export function validateEmail(email: string): string {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required");
  }
  const sanitized = email.trim().toLowerCase();
  if (!isValidEmail(sanitized)) {
    throw new Error("Invalid email format");
  }
  return sanitized;
}
