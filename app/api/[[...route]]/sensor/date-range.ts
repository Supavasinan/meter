import { influxQuery } from "@/lib/influxdb";
import { Hono } from "hono";

const app = new Hono().get("/", async (c) => {
  const fluxQueryMin = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
      |> range(start: 0)
      |> filter(fn: (r) => r._field == "pf")
      |> group()
      |> first()
  `;
  const fluxQueryMax = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
    |> range(start: 0)
    |> filter(fn: (r) => r._field == "pf")
    |> group()
    |> last()
  `;

  const resultMin = await influxQuery(fluxQueryMin);
  const resultMax = await influxQuery(fluxQueryMax);

  return c.json({ min: resultMin, max: resultMax });
});

export default app;
