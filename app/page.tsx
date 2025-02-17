import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PowerAmp } from "./_components/power-amp";
import { PowerCost } from "./_components/power-cost";
import { PowerUsage } from "./_components/power-usage";
import { influxQuery } from "@/lib/influxdb";

const data = {
  amp: {
    value: 2,
    timeSeries: [],
  },
  cost: {
    value: 2,
    timeSeries: [],
  },
  usage: {
    value: 2,
    timeSeries: [],
  },
};

const fluxQuery = `
from(bucket: "${process.env.INFLUX_BUCKET}")
  |> range(start: -3h)
  |> filter(fn: (r) => r._measurement == "sensor_data")
`;

const results = await influxQuery(fluxQuery);

const Home = () => {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider>
        <AppSidebar/>
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <PowerUsage />
              <PowerAmp />
              <PowerCost />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Home;
