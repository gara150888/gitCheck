import * as userService from "../services/user";
import { json } from "../utils/response";
import { AppError } from "../types";
import type { RouteHandler } from "../utils/router";
import { parseIdParam } from "../utils/validation";

export const uploadAvatar: RouteHandler = async (req, params) => {
  const id = parseIdParam(params, "id");

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    throw new AppError(400, "Content-Type must be multipart/form-data");
  }

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;

  if (!file) {
    throw new AppError(400, "No avatar file provided. Field name: 'avatar'");
  }

  const result = await userService.uploadAvatarService(id, file);
  return json({ avatar_url: result.avatar, user: result.user }, 200);
};

export const serveAvatar: RouteHandler = async (req, params) => {
  const filename = params.filename;

  if (!filename || !/^[a-zA-Z0-9_.-]+$/.test(filename)) {
    throw new AppError(404, "File not found");
  }

  const filePath = `${process.cwd()}/uploads/${filename}`;
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    throw new AppError(404, "File not found");
  }

  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000",
    },
  });
};
