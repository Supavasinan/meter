import { Hono } from "hono";
import { handle } from "hono/vercel";
import { PageConfig } from "next";
import all from "./sensor/all";
import dateRange from "./sensor/date-range";

export const config: PageConfig = {
  runtime: "edge",
};

const app = new Hono().basePath("/api/sensor");

const routes = app.route("/all", all).route("/date-range", dateRange);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
