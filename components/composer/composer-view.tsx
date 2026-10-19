"use client"

import { useState, useRef } from "react"
import type { AiVariation } from "@/app/actions/ai"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Upload, Loader2, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"

type Network = "facebook" | "instagram" | "both"
type ContentType = "post" | "carousel" | "reel"

interface MediaItem {
  id: string
  file: File
  preview: string
  isVideo: boolean
  caption: string
  variations: AiVariation[]
  selectedVar: string | null
  generating: boolean
  scheduled: boolean
}

const TIME_SLOTS = ["09:00", "13:00", "18:00"]

export function ComposerView() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [network, setNetwork] = useState<Network>("instagram")
  const [contentType, setContentType] = useState<ContentType>("post")
  const [briefing, setBriefing] = useState({
    theme: "",
    audience: "",
    tone: "Profissional",
    objective: "",
    keywords: "",
    cta: "",
    language: "pt-BR",
  })
  const [generatingAll, setGeneratingAll] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [scheduled, setScheduled] = useState(false)
  const [schedule, setSchedule] = useState({
    startDate: new Date().toISOString().slice(0, 10),
    postsPerDay: 3,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const newItems: MediaItem[] = []
    Array.from(files).forEach((f) => {
      newItems.push({
        id: Math.random().toString(36).slice(2),
        file: f,
        preview: URL.createObjectURL(f),
        isVideo: f.type.startsWith("video"),
        caption: "",
        variations: [],
        selectedVar: null,
        generating: false,
        scheduled: false,
      })
    })
    setItems((prev) => [...prev, ...newItems])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const validateFile = (it: MediaItem) => {
    if (contentType === "reel" && !it.isVideo) {
      toast.error("MP4 obrigatório para Reel")
      return false
    }
    return true
  }

  const generateOne = async (id: string) => {
    const it = items.find((x) => x.id === id)
    if (!it) return
    if (!briefing.theme) {
      toast.error("Preencha o tema do briefing")
      return
    }
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, generating: true } : x)))
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...briefing, variations: 3 }),
      }).then((r) => r.json())
      if (!res.ok) {
        toast.error(res.error || "Falha na Claude API")
        return
      }
      const vars: AiVariation[] = res.variations || []
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, variations: vars, selectedVar: vars[0]?.id || null, caption: vars[0]?.caption || "", generating: false }
            : x,
        ),
      )
    } catch (e: any) {
      toast.error(e?.message || "Erro inesperado")
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, generating: false } : x)))
    }
  }

  const generateAll = async () => {
    if (items.length === 0) {
      toast.error("Envie ao menos uma mídia")
      return
    }
    if (!briefing.theme) {
      toast.error("Preencha o tema do briefing")
      return
    }
    setGeneratingAll(true)
    for (const it of items) {
      if (it.variations.length === 0) {
        await generateOne(it.id)
      }
    }
    setGeneratingAll(false)
    toast.success("Legendas geradas")
  }

  const selectVariation = (itemId: string, varId: string) => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== itemId) return x
        const v = x.variations.find((vv) => vv.id === varId)
        return { ...x, selectedVar: varId, caption: v?.caption || x.caption }
      }),
    )
  }

  // Compute queue: distribute items across days, postsPerDay per day, time slots
  const computeQueue = () => {
    const out: { item: MediaItem; date: string; time: string; scheduledAt: string }[] = []
    const ppd = Math.max(1, schedule.postsPerDay)
    const slots = TIME_SLOTS.slice(0, ppd)
    if (slots.length < ppd) {
      // generate extra slots
      for (let i = slots.length; i < ppd; i++) slots.push(`${String(9 + i * 3).padStart(2, "0")}:00`)
    }
    const start = new Date(schedule.startDate + "T00:00:00")
    items.forEach((it, idx) => {
      const dayOffset = Math.floor(idx / ppd)
      const slotIdx = idx % ppd
      const d = new Date(start.getTime() + dayOffset * 86400000)
      const time = slots[slotIdx] || "09:00"
      const [hh, mm] = time.split(":")
      d.setHours(Number(hh), Number(mm), 0, 0)
      out.push({ item: it, date: d.toISOString().slice(0, 10), time, scheduledAt: d.toISOString() })
    })
    return out
  }
  const queue = computeQueue()

  const handleAddBatch = async () => {
    if (items.length === 0) {
      toast.error("Envie ao menos uma mídia")
      return
    }
    if (items.some((it) => it.variations.length === 0)) {
      toast.error("Gere legendas para todas as mídias antes de agendar")
      return
    }
    if (scheduled) {
      toast.info("Este lote já foi agendado")
      return
    }
    setScheduling(true)
    let okCount = 0
    try {
      for (const q of queue) {
        if (q.item.scheduled) continue
        if (!validateFile(q.item)) continue
        const fd = new FormData()
        fd.append("network", network)
        fd.append("contentType", contentType)
        fd.append("caption", q.item.caption)
        fd.append("start", q.scheduledAt)
        fd.append("intervalValue", "1")
        fd.append("intervalUnit", "hours")
        fd.append("count", "1")
        fd.append("file", q.item.file)
        const res = await fetch("/api/schedule", { method: "POST", body: fd }).then((r) => r.json())
        if (res.ok) {
          okCount++
          setItems((prev) => prev.map((x) => (x.id === q.item.id ? { ...x, scheduled: true } : x)))
        } else {
          toast.error(res.error || "Falha ao agendar " + q.item.file.name)
        }
      }
      if (okCount > 0) {
        setScheduled(true)
        toast.success(`${okCount} publicações adicionadas à fila`)
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro inesperado")
    } finally {
      setScheduling(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload + format */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Upload em lote e formato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/40 p-8 text-center hover:border-primary/50"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              addFiles(e.dataTransfer.files)
            }}
          >
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste ou clique para enviar várias imagens/vídeos de uma vez
            </p>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              aria-label="Upload de mídia em lote"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((it) => (
                <div key={it.id} className="relative rounded-lg border border-border bg-background/40 p-2">
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    aria-label="Remover mídia"
                    className="absolute top-1 right-1 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {it.isVideo ? (
                    <video src={it.preview} className="h-24 w-full rounded object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.preview} alt="preview" className="h-24 w-full rounded object-cover" />
                  )}
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="truncate text-muted-foreground">{it.file.name}</span>
                    {it.variations.length > 0 && <Badge variant="secondary" className="text-[9px]">{it.variations.length} var</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Rede</Label>
              <Select value={network} onValueChange={(v) => setNetwork((v ?? "instagram") as Network)}>
                <SelectTrigger aria-label="Escolher rede"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook Page</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={contentType} onValueChange={(v) => setContentType((v ?? "post") as ContentType)}>
                <SelectTrigger aria-label="Escolher tipo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post estático</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Briefing */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Briefing para IA (aplicado a todas as mídias)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Input id="theme" value={briefing.theme} onChange={(e) => setBriefing({ ...briefing, theme: e.target.value })} aria-label="Tema" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="audience">Público-alvo</Label>
              <Input id="audience" value={briefing.audience} onChange={(e) => setBriefing({ ...briefing, audience: e.target.value })} aria-label="Público-alvo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tom de voz</Label>
              <Input id="tone" value={briefing.tone} onChange={(e) => setBriefing({ ...briefing, tone: e.target.value })} aria-label="Tom de voz" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo</Label>
            <Input id="objective" value={briefing.objective} onChange={(e) => setBriefing({ ...briefing, objective: e.target.value })} aria-label="Objetivo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Palavras-chave</Label>
            <Input id="keywords" value={briefing.keywords} onChange={(e) => setBriefing({ ...briefing, keywords: e.target.value })} aria-label="Palavras-chave" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cta">CTA</Label>
              <Input id="cta" value={briefing.cta} onChange={(e) => setBriefing({ ...briefing, cta: e.target.value })} aria-label="CTA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lang">Idioma</Label>
              <Input id="lang" value={briefing.language} onChange={(e) => setBriefing({ ...briefing, language: e.target.value })} aria-label="Idioma" />
            </div>
          </div>
          <Button onClick={generateAll} disabled={generatingAll || items.length === 0} className="w-full" aria-label="Gerar legendas com IA para todas">
            {generatingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Gerar legendas com IA para todas as mídias
          </Button>
        </CardContent>
      </Card>

      {/* Per-item variations */}
      {items.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Variações por mídia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="rounded-lg border border-border bg-background/40 p-3 space-y-2">
                <div className="flex items-center gap-3">
                  {it.isVideo ? (
                    <video src={it.preview} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.preview} alt="preview" className="h-12 w-12 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.file.name}</p>
                    {it.generating && <p className="text-xs text-muted-foreground">Gerando...</p>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => generateOne(it.id)} disabled={it.generating} aria-label="Gerar para esta mídia">
                    {it.generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  </Button>
                </div>
                {it.variations.length > 0 && (
                  <div className="space-y-2 pl-4">
                    <Select value={it.selectedVar || ""} onValueChange={(v) => selectVariation(it.id, v ?? it.variations[0]?.id)}>
                      <SelectTrigger aria-label="Escolher variação"><SelectValue placeholder="Variação" /></SelectTrigger>
                      <SelectContent>
                        {it.variations.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      rows={3}
                      value={it.caption}
                      onChange={(e) => setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, caption: e.target.value } : x)))}
                      aria-label="Editar legenda"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scheduling */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Agendamento em lote (~3 posts/dia)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data inicial</Label>
              <Input id="startDate" type="date" value={schedule.startDate} onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })} aria-label="Data inicial" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ppd">Posts por dia</Label>
              <Input id="ppd" type="number" min={1} max={6} value={schedule.postsPerDay} onChange={(e) => setSchedule({ ...schedule, postsPerDay: Number(e.target.value) })} aria-label="Posts por dia" />
            </div>
          </div>
          {queue.length > 0 && (
            <div className="rounded-md border border-border bg-background/40 p-3 max-h-64 overflow-auto">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Preview da fila calculada ({queue.length} posts)</p>
              <ul className="space-y-1 text-sm">
                {queue.map((q, i) => (
                  <li key={i} className="flex justify-between tabular-nums text-xs">
                    <span className="truncate max-w-[200px]">{q.item.file.name}</span>
                    <span>{q.date} {q.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button
            onClick={handleAddBatch}
            disabled={scheduling || scheduled || items.length === 0 || items.some((it) => it.variations.length === 0)}
            className="w-full"
            aria-label="Adicionar lote à fila"
          >
            {scheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {scheduling ? "Agendando..." : scheduled ? "Lote agendado ✓" : "Adicionar lote à fila"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
