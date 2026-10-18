import { CalendarView } from "@/components/calendar/calendar-view"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Calendário</h1>
        <p className="text-sm text-muted-foreground">Planejamento mensal de publicações</p>
      </div>
      <CalendarView />
    </div>
  )
}
