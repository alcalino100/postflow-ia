"use client"

import { useState } from "react"
import { syncMetrics } from "@/app/actions/metrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { deltaPct, fmtNumber, fmtCompact } from "@/lib/format"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"

const COLORS = ["#6366f1", "#10b981", "#fbbf24", "#a855f7"]

export interface ReportPayload {
  kpis: { publications: number; reach: number; impressions: number; engagement: number; avgEngagement: number; bestFormat: string }
  kpisPrev: { publications: number; reach: number; impressions: number; engagement: number; avgEngagement: number; bestFormat: string }
  rows: { id: string; thumbnail: string; caption: string; type: string; network: string; date: string; reach: number; likes: number; comments: number; shares: number; saves: number; engagement: number }[]
  dailySeries: { date: string; publicacoes: number; engajamento: number }[]
  formatSeries: { format: string; value: number }[]
  networkSeries: { name: string; value: number }[]
  hourSeries: { hour: string; value: number }[]
}

export function ReportsView({ payload }: { payload: ReportPayload }) {
  const [period, setPeriod] = useState("30")
  const [network, setNetwork] = useState("all")
  const [type, setType] = useState("all")
  const [sort, setSort] = useState("engagement")
  const [selected, setSelected] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)

  const k = payload.kpis
  const kp = payload.kpisPrev
  const kpiCards = [
    { label: "Publicações", value: k.publications, prev: kp.publications },
    { label: "Alcance total", value: k.reach, prev: kp.reach },
    { label: "Impressões", value: k.impressions, prev: kp.impressions },
    { label: "Engajamento total", value: k.engagement, prev: kp.engagement },
    { label: "Engajamento médio/post", value: k.avgEngagement, prev: kp.avgEngagement },
    { label: "Melhor formato", value: k.bestFormat, prev: kp.bestFormat },
  ]

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await syncMetrics()
      toast.success(`${res.synced} métricas sincronizadas`)
      window.location.reload()
    } catch (e: any) {
      toast.error(e?.message || "Falha na sincronização")
    } finally {
      setSyncing(false)
    }
  }

  const exportCsv = () => {
    const header = "id,legenda,tipo,rede,data,alcance,curtidas,comentarios,compartilhamentos,salvamentos,engajamento"
    const rows = payload.rows.map((m) => `${m.id},"${m.caption}",${m.type},${m.network},${m.date},${m.reach},${m.likes},${m.comments},${m.shares},${m.saves},${m.engagement}`)
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ranking.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Select value={period} onValueChange={(v) => setPeriod(v ?? "30")}>
            <SelectTrigger className="w-36" aria-label="Período"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={network} onValueChange={(v) => setNetwork(v ?? "all")}>
            <SelectTrigger className="w-36" aria-label="Rede"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas redes</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(v) => setType(v ?? "all")}>
            <SelectTrigger className="w-36" aria-label="Tipo"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos tipos</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="carousel">Carrossel</SelectItem>
              <SelectItem value="reel">Reel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v ?? "engagement")}>
            <SelectTrigger className="w-44" aria-label="Ordenação"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Engajamento</SelectItem>
              <SelectItem value="reach">Alcance</SelectItem>
              <SelectItem value="likes">Curtidas</SelectItem>
              <SelectItem value="comments">Comentários</SelectItem>
              <SelectItem value="shares">Compartilhamentos</SelectItem>
              <SelectItem value="saves">Salvamentos</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} aria-label="Sincronizar">
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> Sincronizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} aria-label="Exportar CSV">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((c) => {
          const delta = typeof c.value === "number" && typeof c.prev === "number" ? deltaPct(c.value, c.prev) : null
          return (
            <Card key={c.label} className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {typeof c.value === "number" ? fmtCompact(c.value) : c.value}
                </div>
                {delta !== null && (
                  <p className={`text-xs ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {delta >= 0 ? "+" : ""}{delta}% vs período anterior
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-base">Publicações e engajamento por dia</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payload.dailySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", color: "#f4f4f5" }} />
                <Legend />
                <Line type="monotone" dataKey="publicacoes" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="engajamento" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-base">Performance por formato</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payload.formatSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="format" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", color: "#f4f4f5" }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-base">Distribuição por rede</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={payload.networkSeries} dataKey="value" nameKey="name" outerRadius={90} label>
                  {payload.networkSeries.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", color: "#f4f4f5" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-base">Melhores horários</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payload.hourSeries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" stroke="#a1a1aa" fontSize={11} />
                <YAxis type="category" dataKey="hour" stroke="#a1a1aa" fontSize={11} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", color: "#f4f4f5" }} />
                <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Top posts/Reels mais engajados</CardTitle></CardHeader>
        <CardContent>
          {payload.rows.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Ainda não há métricas suficientes</p>
          )}
          {payload.rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mídia</TableHead>
                  <TableHead>Legenda</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Rede</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Alcance</TableHead>
                  <TableHead>Curtidas</TableHead>
                  <TableHead>Coment.</TableHead>
                  <TableHead>Compart.</TableHead>
                  <TableHead>Salvos</TableHead>
                  <TableHead>Engaj.</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payload.rows.map((m, i) => (
                  <TableRow key={m.id} className={i < 3 ? "border-l-2 border-l-primary" : ""}>
                    <TableCell>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.thumbnail} alt="miniatura" className="h-9 w-9 rounded object-cover" />
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">{m.caption}</TableCell>
                    <TableCell className="capitalize">{m.type}</TableCell>
                    <TableCell className="capitalize">{m.network}</TableCell>
                    <TableCell className="text-xs tabular-nums">{m.date}</TableCell>
                    <TableCell className="tabular-nums">{fmtNumber(m.reach)}</TableCell>
                    <TableCell className="tabular-nums">{fmtNumber(m.likes)}</TableCell>
                    <TableCell className="tabular-nums">{fmtNumber(m.comments)}</TableCell>
                    <TableCell className="tabular-nums">{fmtNumber(m.shares)}</TableCell>
                    <TableCell className="tabular-nums">{fmtNumber(m.saves)}</TableCell>
                    <TableCell className="tabular-nums font-semibold">{m.engagement}%</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(m)} aria-label="Ver detalhes">Ver</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>Métricas completas</SheetTitle></SheetHeader>
          {selected && (
            <div className="mt-4 space-y-3 text-sm">
              <p className="font-medium">{selected.caption}</p>
              <div className="grid grid-cols-2 gap-2">
                {["reach", "likes", "comments", "shares", "saves", "engagement"].map((k) => (
                  <div key={k} className="rounded-md border border-border p-2">
                    <p className="text-xs text-muted-foreground capitalize">{k}</p>
                    <p className="font-semibold tabular-nums">{selected[k]}</p>
                  </div>
                ))}
              </div>
              {selected.metaPostId && (
                <a href={`https://www.instagram.com/p/${selected.metaPostId}`} className="text-primary underline text-sm" aria-label="Link para publicação">Abrir publicação</a>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
