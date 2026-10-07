import { createServer } from "./server";
import { ensureUploadDir } from "./services/avatar";

const port = Number.parseInt(process.env.PORT ?? "4000", 10);

ensureUploadDir();

const server = createServer(port);

console.log(`User Profile API running on http://localhost:${server.port}`);
console.log(`Endpoints:
  GET    /                           - API info
  GET    /health                     - Health check
  GET    /api/users                  - List users
  POST   /api/users                  - Create user
  GET    /api/users/:id              - Get user profile
  PUT    /api/users/:id              - Update user profile
  DELETE /api/users/:id              - Delete user
  POST   /api/users/:id/avatar       - Upload avatar (multipart/form-data)
  GET    /uploads/:filename          - Serve uploaded avatar
`);
