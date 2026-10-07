export interface User {
  id: number;
  email: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  bio?: string | null;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  bio?: string | null;
}

export interface AvatarUploadResult {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

export class AppError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
