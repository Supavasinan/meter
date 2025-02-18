"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { mqttClient } from "@/lib/mqtt-client";
import { useGetSensorByDate } from "@/project/api/use-get-sensor-by-date";
import { useLiveModeStore } from "@/project/store/live-mode";
import { Activity, Bolt, TrendingUp, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ElectricityCostCalculator } from "./_components/electricity-cost-calculator";
import { PowerCard } from "./_components/power-card";
import { PowerCardSkeleton } from "./_components/power-card-skeleton";

// Constants for better maintainability
const CARD_DEFINITIONS = [
  { label: "usage", unit: "watts", icon: TrendingUp, key: "power" },
  { label: "current", unit: "A", icon: Bolt, key: "current" },
  { label: "voltage", unit: "V", icon: Zap, key: "voltage" },
  { label: "energy", unit: "KWh", icon: Activity, key: "energy" },
] as const;

const INITIAL_SENSOR_DATA = {
  power: [],
  current: [],
  voltage: [],
  energy: [],
};

const MAX_DATA_POINTS = 100; // Prevent memory bloat from unlimited data growth

export default function Home() {
  const [liveSensorData, setLiveSensorData] = useState(INITIAL_SENSOR_DATA);
  const params = useSearchParams();
  const dateRange = params.get("date") || undefined;

  const { data: sensorData, isLoading } = useGetSensorByDate(dateRange);

  const { liveMode } = useLiveModeStore();

  // Memoized data source based on live mode
  const dataSource = useMemo(
    () => (liveMode ? liveSensorData : sensorData ?? INITIAL_SENSOR_DATA),
    [liveMode, liveSensorData, sensorData]
  );

  // MQTT message handler with data point limiting
  const handleMqttMessage = useCallback((topic: string, payload: Buffer) => {
    try {
      const data = JSON.parse(payload.toString());
      const timestamp = new Date().toISOString();

      setLiveSensorData((prev) =>
        Object.entries(prev).reduce(
          (acc, [key, values]) => ({
            ...acc,
            [key]: [
              ...values.slice(-(MAX_DATA_POINTS - 1)),
              { time: timestamp, value: data[key] },
            ],
          }),
          {} as typeof INITIAL_SENSOR_DATA
        )
      );
    } catch (error) {
      console.error("Error parsing MQTT message", error);
    }
  }, []);

  // MQTT connection management
  useEffect(() => {
    if (!liveMode) {
      mqttClient.disconnect();
      return;
    }
    setLiveSensorData(INITIAL_SENSOR_DATA);

    mqttClient.connect();
    mqttClient.subscribe("topic/sensor");
    mqttClient.onMessage(handleMqttMessage);

    return () => {
      mqttClient.disconnect();
    };
  }, [liveMode, handleMqttMessage]);

  // Memoized recent values to prevent unnecessary recalculations
  const recentValues = useMemo(
    () =>
      Object.entries(dataSource).reduce(
        (acc, [key, values]) => ({
          ...acc,
          [key]: values.length > 0 ? values[values.length - 1].value : 0,
        }),
        {} as Record<keyof typeof INITIAL_SENSOR_DATA, number>
      ),
    [dataSource]
  );

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
              {isLoading && !liveMode
                ? Array(4)
                    .fill(null)
                    .map((_, i) => <PowerCardSkeleton key={i} />)
                : CARD_DEFINITIONS.map(({ key, ...def }) => (
                    <PowerCard
                      key={key}
                      {...def}
                      value={recentValues[key]}
                      timeSeries={dataSource[key]}
                    />
                  ))}
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <ElectricityCostCalculator energyData={dataSource.energy} />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
