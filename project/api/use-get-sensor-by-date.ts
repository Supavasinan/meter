import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetSensorByDate = (dateRange: string | undefined) => {
  return useQuery({
    enabled: !!dateRange,
    queryKey: ["sensorByDate", { dateRange }],
    queryFn: async () => {
      const response = await client.api.sensor.all.$get({
        query: { date: dateRange },
      });

      const data = await response.json();

      if ("error" in data) {
        throw new Error(data.error);
      }
      return data;
    },
  });
};
