import { AppError } from "../types";

export type RouteHandler = (
  req: Request,
  params: Record<string, string>,
  query: URLSearchParams
) => Response | Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

function compilePath(path: string): { pattern: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  let patternStr = path.replace(/:[^/]+/g, (match) => {
    const paramName = match.slice(1);
    paramNames.push(paramName);
    return "([^/]+)";
  });
  patternStr = patternStr === "" ? "/" : patternStr;
  const pattern = new RegExp(`^${patternStr}$`);
  return { pattern, paramNames };
}

export class Router {
  private routes: Route[] = [];

  add(method: string, path: string, handler: RouteHandler): void {
    const { pattern, paramNames } = compilePath(path);
    this.routes.push({ method, pattern, paramNames, handler });
  }

  match(
    method: string,
    url: URL
  ): { handler: RouteHandler; params: Record<string, string>; query: URLSearchParams } | null {
    const pathOnly = url.pathname;
    const query = url.searchParams;

    for (const route of this.routes) {
      const methodMatch =
        route.method === method || (method === "HEAD" && route.method === "GET");
      if (!methodMatch) continue;

      const match = pathOnly.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1]!;
        });
        return { handler: route.handler, params, query };
      }
    }

    return null;
  }
}

export function asyncHandler(
  handler: RouteHandler
): RouteHandler {
  return async (req, params, query) => {
    try {
      return await handler(req, params, query);
    } catch (error) {
      if (error instanceof AppError) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: error.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (error instanceof Error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
