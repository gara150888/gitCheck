import { Router, asyncHandler } from "./utils/router";
import { handleOptions, withCors } from "./middleware/cors";
import { json, notFound } from "./utils/response";
import { AppError } from "./types";

import {
  listUsers,
  getById,
  create,
  update,
  remove,
} from "./routes/users";
import { uploadAvatar, serveAvatar } from "./routes/avatar";

const router = new Router();

router.add("GET", "/", async () => {
  return json({
    name: "User Profile API",
    version: "1.0.0",
    endpoints: {
      profiles: "/api/users",
      avatar: "/api/users/:id/avatar",
      uploads: "/uploads/:filename",
      health: "/health",
    },
  });
});

router.add("GET", "/health", async () => json({ status: "ok" }));

router.add("GET", "/api/users", asyncHandler(listUsers));
router.add("POST", "/api/users", asyncHandler(create));
router.add("GET", "/api/users/:id", asyncHandler(getById));
router.add("PUT", "/api/users/:id", asyncHandler(update));
router.add("DELETE", "/api/users/:id", asyncHandler(remove));
router.add("POST", "/api/users/:id/avatar", asyncHandler(uploadAvatar));
router.add("GET", "/uploads/:filename", asyncHandler(serveAvatar));

export function createServer(port: number = 4000) {
  return Bun.serve({
    port,
    hostname: "0.0.0.0",
    async fetch(req) {
      const url = new URL(req.url);

      if (req.method === "OPTIONS") {
        return handleOptions();
      }

      const match = router.match(req.method, url);
      if (!match) {
        return withCors(notFound());
      }

      try {
        const response = await match.handler(req, match.params, match.query);
        return withCors(response);
      } catch (err: unknown) {
        if (err instanceof AppError) {
          return withCors(json({ error: err.message }, err.status));
        }
        if (err instanceof SyntaxError) {
          return withCors(json({ error: "Invalid JSON body" }, 400));
        }
        console.error("Unhandled error:", err);
        return withCors(json({ error: "Internal Server Error" }, 500));
      }
    },
  });
}
