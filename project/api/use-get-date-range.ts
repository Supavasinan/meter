import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetDateRange = () => {
  return useQuery({
    queryKey: ["date-range"],
    queryFn: async () => {
      const response = await client.api.sensor["date-range"].$get();
      return await response.json();
    },
  });
};
