import { useQuery } from "@tanstack/react-query";

export const useGetVoltage = () => {
  return useQuery({ 
    queryKey: ["voltage"],

   });
};
