import { kpis, mockPosts } from "@/lib/mock-data"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { UpcomingTable } from "@/components/dashboard/upcoming-table"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral das suas publicações</p>
        </div>
      </div>
      <KpiCards />
      <UpcomingTable posts={mockPosts} />
    </div>
  )
}
