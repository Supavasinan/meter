import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PowerCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-10" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="mt-4 h-[80px]" />
      </CardContent>
    </Card>
  )
}

