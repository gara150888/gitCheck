import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

mkdirSync(join(process.cwd(), "data"), { recursive: true });

const db = new Database(join(process.cwd(), "data", "app.db"));

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TRIGGER IF NOT EXISTS users_updated_at_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
  END
`);

export function getAllUsers(): UserRecord[] {
  return db
    .query("SELECT id, email, name, bio, avatar_url, created_at, updated_at FROM users ORDER BY id")
    .all() as UserRecord[];
}

export function getUserById(id: number): UserRecord | null {
  return db
    .query(
      "SELECT id, email, name, bio, avatar_url, created_at, updated_at FROM users WHERE id = ?"
    )
    .get(id) as UserRecord | null;
}

export function getUserByEmail(email: string): Pick<UserRecord, "id" | "email"> | null {
  return db
    .query("SELECT id, email FROM users WHERE email = ?")
    .get(email) as Pick<UserRecord, "id" | "email"> | null;
}

export function createUser(email: string, name: string, bio: string | null): UserRecord {
  return db
    .query(
      "INSERT INTO users (email, name, bio) VALUES (?, ?, ?) RETURNING id, email, name, bio, avatar_url, created_at, updated_at"
    )
    .get(email, name, bio) as UserRecord;
}

export function updateUser(
  id: number,
  data: { email?: string; name?: string; bio?: string | null }
): UserRecord | null {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }
  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.bio !== undefined) {
    fields.push("bio = ?");
    values.push(data.bio);
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ? RETURNING id, email, name, bio, avatar_url, created_at, updated_at`;
  return db.query(query).get(...values) as UserRecord | null;
}

export function updateAvatarUrl(id: number, avatarUrl: string | null): UserRecord | null {
  return db
    .query(
      "UPDATE users SET avatar_url = ? WHERE id = ? RETURNING id, email, name, bio, avatar_url, created_at, updated_at"
    )
    .get(avatarUrl, id) as UserRecord | null;
}

export function deleteUser(id: number): boolean {
  const result = db.query("DELETE FROM users WHERE id = ?").run(id);
  return result.changes > 0;
}

export interface UserRecord {
  id: number;
  email: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
