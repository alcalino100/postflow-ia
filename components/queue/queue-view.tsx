"use client"

import { useState } from "react"
import { mockPosts, queueLogs } from "@/lib/mock-data"
import { ScheduledPost } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Pause, Play, Copy, Trash2, Eye, Filter } from "lucide-react"
import { toast } from "sonner"

function statusBadge(status: ScheduledPost["status"]) {
  const map: Record<ScheduledPost["status"], { label: string; cls: string }> = {
    scheduled: { label: "Agendado", cls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
    publishing: { label: "Publicando", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    published: { label: "Publicado", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    failed: { label: "Falhou", cls: "bg-red-500/15 text-red-300 border-red-500/30" },
    paused: { label: "Pausado", cls: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30" },
  }
  const m = map[status]
  return <Badge variant="outline" className={m.cls}>{m.label}</Badge>
}

export function QueueView() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [period, setPeriod] = useState("")
  const [logPost, setLogPost] = useState<ScheduledPost | null>(null)

  const filtered = mockPosts.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false
    if (networkFilter !== "all" && p.network !== networkFilter) return false
    if (typeFilter !== "all" && p.type !== typeFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-40" aria-label="Filtrar status"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="publishing">Publicando</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={networkFilter} onValueChange={(v) => setNetworkFilter(v ?? "all")}>
            <SelectTrigger className="w-40" aria-label="Filtrar rede"><SelectValue placeholder="Rede" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas redes</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-40" aria-label="Filtrar tipo"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos tipos</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="carousel">Carrossel</SelectItem>
              <SelectItem value="reel">Reel</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-44" aria-label="Período" />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mídia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Rede</TableHead>
                <TableHead>Legenda</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail} alt="miniatura" className="h-10 w-10 rounded object-cover" />
                  </TableCell>
                  <TableCell className="capitalize">{p.type}</TableCell>
                  <TableCell className="capitalize">{p.network}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{p.caption}</TableCell>
                  <TableCell className="tabular-nums text-xs">{new Date(p.scheduledAt).toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" aria-label="Pausar/Retomar" onClick={() => toast.info("Pausar/retomar (mock)")}>
                      {p.status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Duplicar" onClick={() => toast.info("Duplicado (mock)")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Ver log" onClick={() => setLogPost(p)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => toast.info("Excluído (mock)")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!logPost} onOpenChange={(o) => !o && setLogPost(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Log técnico</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 text-sm">
            {logPost && (
              <>
                <p><span className="text-muted-foreground">Post:</span> {logPost.id}</p>
                <p><span className="text-muted-foreground">Status:</span> {logPost.status}</p>
                {logPost.error && <p className="text-red-400">{logPost.error}</p>}
                {queueLogs.filter((l) => l.postId === logPost.id).map((l, i) => (
                  <div key={i} className="rounded-md border border-border p-3">
                    <p>Tentativas: {l.attempts}</p>
                    <p>Última: {new Date(l.lastAttempt).toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">{l.message}</p>
                  </div>
                ))}
                {queueLogs.filter((l) => l.postId === logPost.id).length === 0 && (
                  <p className="text-muted-foreground">Sem logs técnicos registrados.</p>
                )}
                <Button variant="outline" className="w-full" onClick={() => toast.info("Tentar novamente (mock)")}>
                  Tentar novamente
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
