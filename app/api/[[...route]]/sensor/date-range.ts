import { influxQuery } from "@/lib/influxdb";
import { Hono } from "hono";

const app = new Hono().get("/", async (c) => {
  const fluxQuery = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
      |> range(start: 0)
      |> group(columns: ["_time"])
      |> keep(columns: ["_time"])
      |> distinct(column: "_time")
  `;

  try {
    // Execute the query
    const result = await influxQuery(fluxQuery);

    // Check if the result is empty
    if (!result || result.length === 0) {
      return c.json(
        { error: "No data available for the specified field." },
        404
      );
    }

    // Extract unique dates from the results
    const availableDates = result.map((record) => {
      const date = new Date(record._time);
      return date.toISOString().split("T")[0]; // Format as "YYYY-MM-DD"
    });
    // Remove duplicates and sort the dates
    const uniqueDates = [...new Set(availableDates)].sort();

    return c.json({ available: uniqueDates });
  } catch (error) {
    console.error("Error querying InfluxDB:", error);
    return c.json({ error: "An error occurred while fetching data." }, 500);
  }
});

export default app;
