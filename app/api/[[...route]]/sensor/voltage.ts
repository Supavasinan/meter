import { influxQuery } from "@/lib/influxdb";
import { Hono } from "hono";

const app = new Hono().get("/", async (c) => {
  const fluxQuery = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
    |> range(start: 0)
    |> filter(fn: (r) => r._measurement == "sensor_data")
    |> filter(fn: (r) => r._field == "voltage")
    `;

  const result = await influxQuery(fluxQuery);

  return c.json(result);
});

export default app;
