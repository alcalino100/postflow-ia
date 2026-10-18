import { ReportsView } from "@/components/reports/reports-view"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Performance de posts e Reels</p>
      </div>
      <ReportsView />
    </div>
  )
}
