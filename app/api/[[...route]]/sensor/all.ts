import { influxQuery } from "@/lib/influxdb";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

type TimeSeriesItem = {
  time: string;
  value: number;
};

type TimeSeriesData = {
  current: TimeSeriesItem[];
  energy: TimeSeriesItem[];
  pf: TimeSeriesItem[];
  power: TimeSeriesItem[];
  voltage: TimeSeriesItem[];
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
  zValidator("query", z.object({ date: z.string().optional() })),
  async (c) => {
    const { date } = c.req.valid("query");

    const { start, stop } = date
      ? {
          start: `${date}T00:00:00Z`,
          stop: `${date}T23:59:59Z`,
        }
      : {
          start: "1970-01-01T00:00:00Z",
          stop: "now()",
        };

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
    const simplified = simplifyTimeSeriesOutput(result);
    return c.json(simplified);
  }
);

export default app;
