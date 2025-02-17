import { Hono } from "hono";
import { handle } from "hono/vercel";
import { PageConfig } from "next";
import dateRange from "./sensor/date-range";
import voltage from "./sensor/voltage";

export const config: PageConfig = {
  runtime: "edge",
};

const app = new Hono().basePath("/api/sensor");

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

const routes = app.route("/voltage", voltage).route("/date-range", dateRange);

export type AppType = typeof routes;
