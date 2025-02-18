import { influxQuery } from "@/lib/influxdb";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

type TimeSeriesItem = {
  time: string;
  value: number;
};

type TimeSeriesData = {
  [key: string]: TimeSeriesItem[];
};

export const simplifyTimeSeriesOutput = (items: any[]): TimeSeriesData =>
  items.reduce((acc, { _time, _value, _field }) => {
    const time = new Date(_time).toISOString();
    if (!acc[_field]) acc[_field] = [];
    acc[_field].push({ time, value: _value });
    return acc;
  }, {} as TimeSeriesData);

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    })
  ),
  async (c) => {
    const { date } = c.req.valid("query");

    const start = new Date(`${date}T00:00:00+07:00`);
    const stop = new Date(start.getTime() + 86400000);

    const startStr = start.toISOString().split(".")[0] + "Z";
    const stopStr = stop.toISOString().split(".")[0] + "Z";

    // Diagnostic query
    const debugQuery = `
      from(bucket: "${process.env.INFLUX_BUCKET}")
        |> range(start: 2025-02-17T00:00:00Z)
        |> filter(fn: (r) => r._measurement == "sensor_data")
        |> limit(n: 1)
        |> yield(name: "diagnostic")
    `;

    try {
      // First check basic connectivity
      const diagnostic = await influxQuery(debugQuery);
      console.log("Diagnostic result:", diagnostic);

      // Main query
      const mainQuery = `
        from(bucket: "${process.env.INFLUX_BUCKET}")
          |> range(start: ${startStr}, stop: ${stopStr})
          |> filter(fn: (r) => r._measurement == "sensor_data")
          |> filter(fn: (r) => exists r._value)
          |> yield(name: "main")
      `;

      const result = await influxQuery(mainQuery);
      console.log("Raw query result:", result);

      if (result.length === 0) {
        return c.json({
          warning: "No data found",
          query_used: mainQuery,
          time_range: { start: start.toISOString(), stop: stop.toISOString() },
        });
      }

      const simplified = simplifyTimeSeriesOutput(result);
      return c.json(simplified);
    } catch (error) {
      console.error("Full error details:", error);
      return c.json(
        {
          error: "Query failed",
          query: debugQuery,
        },
        500
      );
    }
  }
);

export default app;
