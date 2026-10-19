"use client"

import { useMemo, useState } from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { toast } from "sonner"

const networks = ["facebook", "instagram"] as const
const types = ["post", "carousel", "reel"] as const
const statuses = ["scheduled", "published", "failed", "paused", "publishing"] as const

function colorFor(network: string, status: string) {
  if (status === "published") return "bg-emerald-500/80"
  if (status === "failed") return "bg-red-500/80"
  if (status === "paused") return "bg-zinc-500/80"
  return network === "instagram" ? "bg-pink-500/80" : "bg-indigo-500/80"
}

export function CalendarView({ events }: { events: any[] }) {
  const [current, setCurrent] = useState(new Date(2026, 9, 1))
  const [filters, setFilters] = useState({ networks: new Set(networks), types: new Set(types), statuses: new Set(statuses) })
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [current])

  const eventsForDay = (d: Date) =>
    events.filter((e) => {
      if (!isSameDay(new Date(e.date + "T00:00:00"), d)) return false
      if (!filters.networks.has(e.network as any)) return false
      if (!filters.types.has(e.type as any)) return false
      if (!filters.statuses.has(e.status as any)) return false
      return true
    })

  const toggle = (group: "networks" | "types" | "statuses", val: string) => {
    setFilters((f) => {
      const s = new Set(f[group])
      if (s.has(val as any)) s.delete(val as any)
      else s.add(val as any)
      return { ...f, [group]: s }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Mês anterior" onClick={() => setCurrent(subMonths(current, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-heading text-lg font-semibold capitalize">
            {format(current, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="outline" size="icon" aria-label="Próximo mês" onClick={() => setCurrent(addMonths(current, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {networks.map((n) => (
            <button
              key={n}
              onClick={() => toggle("networks", n)}
              aria-label={`Filtrar ${n}`}
              className={`rounded-full border px-2 py-0.5 capitalize ${filters.networks.has(n) ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground"}`}
            >
              {n}
            </button>
          ))}
          {types.map((t) => (
            <button
              key={t}
              onClick={() => toggle("types", t)}
              aria-label={`Filtrar ${t}`}
              className={`rounded-full border px-2 py-0.5 capitalize ${filters.types.has(t) ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const evs = eventsForDay(d)
          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelectedDay(d)}
              aria-label={`Dia ${format(d, "dd/MM")}`}
              className={`min-h-[88px] rounded-md border p-1 text-left transition-colors ${
                isSameMonth(d, current) ? "border-border bg-card/40 hover:bg-card" : "border-transparent bg-transparent text-muted-foreground/40"
              }`}
            >
              <div className="text-xs font-medium">{format(d, "d")}</div>
              <div className="mt-1 space-y-0.5">
                {evs.slice(0, 3).map((e) => (
                  <div key={e.id} className={`truncate rounded px-1 py-0.5 text-[10px] text-white ${colorFor(e.network, e.status)}`}>
                    {e.network === "instagram" ? "IG" : "FB"} · {e.type}
                  </div>
                ))}
                {evs.length > 3 && <div className="text-[10px] text-muted-foreground">+{evs.length - 3}</div>}
              </div>
            </button>
          )
        })}
      </div>

      <Sheet open={!!selectedDay} onOpenChange={(o) => !o && setSelectedDay(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {selectedDay ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR }) : ""}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {selectedDay && eventsForDay(selectedDay).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma publicação neste dia.</p>
            )}
            {selectedDay && eventsForDay(selectedDay).map((e) => (
              <div key={e.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">{e.type}</Badge>
                  <span className="text-xs text-muted-foreground capitalize">{e.network}</span>
                </div>
                <p className="mt-2 text-sm">{e.caption}</p>
              </div>
            ))}
            <div className="space-y-2 border-t border-border pt-4">
              <Label>Criar agendamento</Label>
              <Input type="time" aria-label="Hora" />
              <Select>
                <SelectTrigger aria-label="Rede"><SelectValue placeholder="Rede" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => { toast.success("Agendamento criado (mock)"); setSelectedDay(null) }}>
                Salvar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
