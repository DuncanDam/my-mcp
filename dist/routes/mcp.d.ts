import { Hono } from 'hono';
declare const mcp: Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export { mcp as mcpRoutes };
