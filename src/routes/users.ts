import * as userService from "../services/user";
import { json } from "../utils/response";
import type { RouteHandler } from "../utils/router";
import { parseIdParam } from "../utils/validation";
import type { CreateUserRequest, UpdateUserRequest } from "../types";

export const listUsers: RouteHandler = async () => {
  const users = await userService.listUsersService();
  return json(users);
};

export const getById: RouteHandler = async (req, params) => {
  const id = parseIdParam(params, "id");
  const user = await userService.getUserService(id);
  return json(user);
};

export const create: RouteHandler = async (req) => {
  const body = (await req.json()) as CreateUserRequest;
  const user = await userService.createUserService(body.email, body.name, body.bio ?? null);
  return json(user, 201);
};

export const update: RouteHandler = async (req, params) => {
  const id = parseIdParam(params, "id");
  const body = (await req.json()) as UpdateUserRequest;
  const user = await userService.updateUserService(id, body);
  return json(user);
};

export const remove: RouteHandler = async (req, params) => {
  const id = parseIdParam(params, "id");
  await userService.deleteUserService(id);
  return new Response(null, { status: 204 });
};
