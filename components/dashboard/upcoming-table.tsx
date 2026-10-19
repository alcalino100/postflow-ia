"use client"

import { useState } from "react"
import { ScheduledPost } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Pause, Trash2, Plus } from "lucide-react"
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

export function UpcomingTable({ posts: initialPosts }: { posts: ScheduledPost[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [open, setOpen] = useState(false)
  const handleEdit = async (p: ScheduledPost) => {
    const v = window.prompt("Nova data/hora (YYYY-MM-DDTHH:mm)", p.scheduledAt.slice(0, 16))
    if (!v) return
    const res = await fetch(`/api/schedule/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduled_at: new Date(v).toISOString() }) }).then((r) => r.json())
    if (res.ok) { setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, scheduledAt: new Date(v).toISOString() } : x))); toast.success("Atualizado") }
    else toast.error(res.error || "Falha")
  }
  const handleDelete = async (post: any) => {
    console.log("DELETE post:", JSON.stringify(post))
    const id = post?.id ?? post?.ID ?? Object.values(post || {})[0]
    if (!id) { toast.error("POST=" + JSON.stringify(post)); return }
    const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" }).then((r) => r.json())
    if (res.ok) { setPosts((prev) => prev.filter((p) => p.id !== id)); toast.success("Excluído") }
    else toast.error(res.error || "Falha ao excluir")
  }
  const handleTogglePause = async (p: ScheduledPost) => {
    const newStatus = p.status === "paused" ? "scheduled" : "paused"
    const res = await fetch(`/api/schedule/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) }).then((r) => r.json())
    if (res.ok) { setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: newStatus as any } : x))); toast.success(newStatus === "paused" ? "Pausado" : "Retomado") }
    else toast.error(res.error || "Falha")
  }
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Próximas publicações</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" aria-label="Novo agendamento"><Plus className="h-4 w-4" /> Novo agendamento</Button>} />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo agendamento</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                toast.success("Agendamento criado (mock)")
                setOpen(false)
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="media">Mídia</Label>
                <Input id="media" type="file" aria-label="Upload de mídia" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Rede</Label>
                  <Select>
                    <SelectTrigger aria-label="Escolher rede"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger aria-label="Escolher tipo"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="carousel">Carrossel</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dt">Data e hora</Label>
                <Input id="dt" type="datetime-local" aria-label="Data e hora" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Legenda</Label>
                <Textarea id="caption" rows={3} aria-label="Legenda" />
              </div>
              <Button type="submit" className="w-full" aria-label="Criar agendamento">Criar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma publicação agendada</p>
            <Button className="mt-4" onClick={() => setOpen(true)} aria-label="Criar primeiro agendamento">Criar primeiro agendamento</Button>
          </div>
        )}
        {posts.length > 0 && <div className="hidden md:block">
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
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail} alt="miniatura" className="h-10 w-10 rounded object-cover" />
                  </TableCell>
                  <TableCell className="capitalize">{p.type}</TableCell>
                  <TableCell className="capitalize">{p.network}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{p.caption}</TableCell>
                  <TableCell className="tabular-nums text-xs">
                    {new Date(p.scheduledAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => handleEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Pausar" onClick={() => handleTogglePause(p)}>
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => handleDelete(p)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>}
        {posts.length > 0 && <div className="space-y-3 md:hidden">
          {posts.map((p) => (
            <div key={p.id} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail} alt="miniatura" className="h-12 w-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium capitalize">{p.type}</span>
                    <span className="text-xs text-muted-foreground capitalize">{p.network}</span>
                    {statusBadge(p.status)}
                  </div>
                  <p className="mt-1 text-sm truncate">{p.caption}</p>
                  <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                    {new Date(p.scheduledAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>}
      </CardContent>
    </Card>
  )
}
