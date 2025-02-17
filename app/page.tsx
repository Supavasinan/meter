"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetSensorByDate } from "@/project/api/use-get-sensor-by-date";
import { Activity, ChevronsLeftRightEllipsis, DollarSign } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PowerCard } from "./_components/power-card";

const Home = () => {
  const params = useSearchParams();
  const dateRange = params.get("date") || undefined;

  const sensorData = useGetSensorByDate(dateRange);

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
              <PowerCard
                label="usage"
                value={233}
                timeSeries={sensorData.data?.power}
                unit="watts"
                icon={ChevronsLeftRightEllipsis}
              />
              <PowerCard
                label="current"
                value={2}
                unit="A"
                icon={Activity}
                timeSeries={sensorData.data?.current}
              />
              <PowerCard
                label="voltage"
                value={230}
                unit="V"
                icon={Activity}
                timeSeries={sensorData.data?.voltage}
              />
              <PowerCard
                label="cost"
                value={233}
                timeSeries={sensorData.data?.power}
                unit="USD/H"
                icon={DollarSign}
              />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Home;
