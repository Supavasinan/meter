"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useGetSensorByDate } from "@/project/api/use-get-sensor-by-date"
import { Activity, Bolt, TrendingUp, Zap } from 'lucide-react'
import { useSearchParams } from "next/navigation"
import { PowerCard } from "./_components/power-card"
import { PowerCardSkeleton } from "./_components/power-card-skeleton"
import { ElectricityCostCalculator } from "./_components/electricity-cost-calculator"

const Home = () => {
  const params = useSearchParams()
  const dateRange = params.get("date") || undefined

  const sensorData = useGetSensorByDate(dateRange)

  // Pass the full energy data to the ElectricityCostCalculator
  const energyData = sensorData.data?.energy || []

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
              {sensorData.isLoading ? (
                <>
                  <PowerCardSkeleton />
                  <PowerCardSkeleton />
                  <PowerCardSkeleton />
                  <PowerCardSkeleton />
                </>
              ) : (
                <>
                  <PowerCard
                    label="usage"
                    value={233}
                    timeSeries={sensorData.data?.power}
                    unit="watts"
                    icon={TrendingUp}
                  />
                  <PowerCard label="current" value={2} unit="A" icon={Bolt} timeSeries={sensorData.data?.current} />
                  <PowerCard label="voltage" value={230} unit="V" icon={Zap} timeSeries={sensorData.data?.voltage} />
                  <PowerCard
                    label="energy"
                    value={233}
                    timeSeries={sensorData.data?.energy}
                    unit="KWh"
                    icon={Activity}
                  />
                </>
              )}
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <ElectricityCostCalculator energyData={energyData} />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default Home
