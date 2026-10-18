import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { kpis } from "@/lib/mock-data"
import { Calendar, Film, Clock, TrendingUp } from "lucide-react"

const items = [
  { label: "Posts agendados", value: kpis.scheduled, icon: Calendar, color: "text-indigo-400" },
  { label: "Reels agendados", value: kpis.reels, icon: Film, color: "text-amber-400" },
  { label: "Publicações nas próximas 24h", value: kpis.next24h, icon: Clock, color: "text-emerald-400" },
  { label: "Taxa média de engajamento", value: `${kpis.avgEngagement}%`, icon: TrendingUp, color: "text-indigo-400" },
]

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{it.label}</CardTitle>
            <it.icon className={`h-4 w-4 ${it.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{it.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
