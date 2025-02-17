import { influxQuery } from "@/lib/influxdb";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const simplifyFluxOutput = (data: any[]): any[] => {
  const grouped: Record<string, any> = {};

  data.forEach((row) => {
    const time = row._time;
    if (!grouped[time]) {
      grouped[time] = {
        _start: row._start,
        _stop: row._stop,
        _time: row._time,
      };
    }
    // Each field is added as a key with its value.
    grouped[time][row._field] = row._value;
  });

  return Object.values(grouped);
};

const app = new Hono().get(
  "/",
  zValidator("query", z.object({ date: z.string().optional() })),
  async (c) => {
    const { date } = c.req.valid("query");

    // Create start and stop times based on the provided date (default to full range).
    const { start, stop } = date
      ? {
          start: `${date}T00:00:00Z`,
          stop: `${date}T23:59:59Z`,
        }
      : {
          start: "1970-01-01T00:00:00Z",
          stop: "now()",
        };

    // Build the Flux query using the dynamic time range.
    const fluxQuery = date
      ? `
        from(bucket: "${process.env.INFLUX_BUCKET}")
          |> range(start: time(v: "${start}"), stop: time(v: "${stop}"))
          |> filter(fn: (r) => r._measurement == "sensor_data")
      `
      : `
        from(bucket: "${process.env.INFLUX_BUCKET}")
          |> range(start: time(v: "${start}"), stop: ${stop})
          |> filter(fn: (r) => r._measurement == "sensor_data")
      `;

    const result = await influxQuery(fluxQuery);
    const simplified = simplifyFluxOutput(result);

    return c.json(simplified);
  }
);

export default app;
