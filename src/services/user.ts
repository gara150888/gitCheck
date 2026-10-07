import * as db from "../db";
import { deleteAvatarFile, saveAvatar } from "./avatar";
import { AppError } from "../types";
import type { User } from "../types";
import {
  validateEmail,
  validateName,
  validateBio,
} from "../utils/validation";

export async function createUserService(
  email: string,
  name: string,
  bio: string | null
): Promise<User> {
  const cleanEmail = validateEmail(email);
  const cleanName = validateName(name);
  const cleanBio = validateBio(bio);

  const existing = db.getUserByEmail(cleanEmail);
  if (existing) {
    throw new AppError(409, "A user with this email already exists");
  }

  const user = db.createUser(cleanEmail, cleanName, cleanBio);
  return mapUser(user);
}

export async function getUserService(id: number): Promise<User> {
  const user = db.getUserById(id);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return mapUser(user);
}

export async function listUsersService(): Promise<User[]> {
  const users = db.getAllUsers();
  return users.map(mapUser);
}

export async function updateUserService(
  id: number,
  data: { email?: string; name?: string; bio?: string | null }
): Promise<User> {
  const existing = db.getUserById(id);
  if (!existing) {
    throw new AppError(404, "User not found");
  }

  const updates: { email?: string; name?: string; bio?: string | null } = {};

  if (data.email !== undefined) {
    const cleanEmail = validateEmail(data.email);
    if (cleanEmail !== existing.email) {
      const dup = db.getUserByEmail(cleanEmail);
      if (dup && dup.id !== id) {
        throw new AppError(409, "A user with this email already exists");
      }
    }
    updates.email = cleanEmail;
  }

  if (data.name !== undefined) {
    updates.name = validateName(data.name);
  }

  if (data.bio !== undefined) {
    updates.bio = validateBio(data.bio);
  }

  const updated = db.updateUser(id, updates);
  if (!updated) {
    throw new AppError(404, "User not found");
  }
  return mapUser(updated);
}

export async function deleteUserService(id: number): Promise<void> {
  const existing = db.getUserById(id);
  if (!existing) {
    throw new AppError(404, "User not found");
  }

  if (existing.avatar_url) {
    const filename = existing.avatar_url.replace(/^\//, "").split("/").pop();
    deleteAvatarFile(filename ?? null);
  }

  db.deleteUser(id);
}

export async function uploadAvatarService(
  id: number,
  file: File
): Promise<{ user: User; avatar: User["avatar_url"] }> {
  const existing = db.getUserById(id);
  if (!existing) {
    throw new AppError(404, "User not found");
  }

  if (existing.avatar_url) {
    const oldFilename = existing.avatar_url.replace(/^\//, "").split("/").pop();
    deleteAvatarFile(oldFilename ?? null);
  }

  const result = await saveAvatar(file, id);

  const updated = db.updateAvatarUrl(id, result.url);
  if (!updated) {
    throw new AppError(404, "User not found");
  }
  return { user: mapUser(updated), avatar: result.url };
}

function mapUser(record: db.UserRecord): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    bio: record.bio,
    avatar_url: record.avatar_url,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}
