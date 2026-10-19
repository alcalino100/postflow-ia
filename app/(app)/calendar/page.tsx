import { listScheduledPosts } from "@/app/actions/schedule"
import { CalendarView } from "@/components/calendar/calendar-view"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  let events: any[] = []
  try {
    const rows = await listScheduledPosts()
    events = rows.map((r) => ({
      id: r.id,
      date: r.scheduled_at.slice(0, 10),
      network: r.network,
      type: r.type,
      status: r.status,
      caption: r.caption || "",
    }))
  } catch {
    events = []
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Calendário</h1>
        <p className="text-sm text-muted-foreground">Planejamento mensal de publicações</p>
      </div>
      <CalendarView events={events} />
    </div>
  )
}
