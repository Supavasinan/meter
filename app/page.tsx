"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Activity, ChevronsLeftRightEllipsis, DollarSign } from "lucide-react";
import { PowerCard } from "./_components/power-card";

const Home = () => {
  // const params = useSearchParams();
  // const dateRange = params.get("date") || undefined;

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <PowerCard
                label="usage"
                value={233}
                unit="watts"
                icon={ChevronsLeftRightEllipsis}
              />
              <PowerCard label="amp" value={2} unit="A" icon={Activity} />
              <PowerCard
                label="cost"
                value={233}
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
