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
import { Sparkles, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Network = "facebook" | "instagram" | "both"
type ContentType = "post" | "carousel" | "reel"

export function ComposerView() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
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
    variations: 3,
  })
  const [generating, setGenerating] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [scheduled, setScheduled] = useState(false)
  const [variations, setVariations] = useState<AiVariation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [editedCaption, setEditedCaption] = useState("")
  const [schedule, setSchedule] = useState({
    start: "",
    intervalValue: 2,
    intervalUnit: "hours" as "hours" | "days",
    count: 3,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (f: File | null) => {
    setFile(f)
    if (f) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const validateFile = () => {
    if (!file) {
      toast.error("Arquivo obrigatório para Post/Reel")
      return false
    }
    if (contentType === "reel" && !file.type.includes("video")) {
      toast.error("MP4 obrigatório para Reel")
      return false
    }
    return true
  }

  const handleGenerate = async () => {
    if (!briefing.theme) {
      toast.error("Preencha o tema do briefing")
      return
    }
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...briefing, variations: Number(briefing.variations) }) }).then((r) => r.json())
      if (!res.ok) {
        toast.error(res.error || "Falha na Claude API")
        return
      }
      setVariations(res.variations || [])
      if (res.variations?.[0]) {
        setSelected(res.variations[0].id)
        setEditedCaption(res.variations[0].caption)
      }
      toast.success("Legendas geradas")
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Erro inesperado")
    } finally {
      setGenerating(false)
    }
  }

  const calcQueue = () => {
    if (!schedule.start) return []
    const out: { n: number; date: Date }[] = []
    const base = new Date(schedule.start)
    const ms = schedule.intervalUnit === "hours" ? schedule.intervalValue * 3600000 : schedule.intervalValue * 86400000
    for (let i = 0; i < schedule.count; i++) {
      out.push({ n: i + 1, date: new Date(base.getTime() + i * ms) })
    }
    return out
  }
  const queue = calcQueue()

  const handleAddQueue = async () => {
    if (scheduled) {
      toast.info("Esta mídia já foi agendada")
      return
    }
    if (!validateFile()) return
    if (variations.length === 0) {
      toast.error("Gere legendas antes de adicionar")
      return
    }
    setScheduling(true)
    try {
      const fd = new FormData()
      fd.append("network", network)
      fd.append("contentType", contentType)
      fd.append("caption", editedCaption || variations[0]?.caption || "")
      fd.append("start", schedule.start ? new Date(schedule.start).toISOString() : new Date().toISOString())
      fd.append("intervalValue", String(schedule.intervalValue))
      fd.append("intervalUnit", schedule.intervalUnit)
      fd.append("count", String(schedule.count))
      if (file) fd.append("file", file)
      const res = await fetch("/api/schedule", { method: "POST", body: fd }).then((r) => r.json())
      if (res.ok) {
        setScheduled(true)
        toast.success(`${res.count} publicações adicionadas à fila`)
      } else {
        toast.error(res.error || "Falha ao agendar")
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro inesperado")
    } finally {
      setScheduling(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left */}
      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Upload e formato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/40 p-8 text-center hover:border-primary/50"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files?.[0]
                if (f) onFile(f)
              }}
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Arraste ou clique para enviar imagem, carrossel ou vídeo MP4"}
              </p>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                aria-label="Dropzone de mídia"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
            </div>
            {preview && (
              <div className="overflow-hidden rounded-md border border-border">
                {file?.type.startsWith("video") ? (
                  <video src={preview} controls className="max-h-64 w-full" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="max-h-64 w-full object-contain" />
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Rede</Label>
                <Select value={network} onValueChange={(v) => setNetwork(v as Network)}>
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
                <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
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

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Briefing para IA</CardTitle>
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
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cta">CTA</Label>
                <Input id="cta" value={briefing.cta} onChange={(e) => setBriefing({ ...briefing, cta: e.target.value })} aria-label="CTA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Idioma</Label>
                <Input id="lang" value={briefing.language} onChange={(e) => setBriefing({ ...briefing, language: e.target.value })} aria-label="Idioma" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="var">Variações</Label>
                <Input id="var" type="number" min={1} max={5} value={briefing.variations} onChange={(e) => setBriefing({ ...briefing, variations: Number(e.target.value) })} aria-label="Quantidade de variações" />
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full" aria-label="Gerar legendas com IA">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Gerar legendas com IA
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right */}
      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Variações de IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {variations.length === 0 && (
              <p className="text-sm text-muted-foreground">Envie uma mídia e descreva o briefing para gerar legendas.</p>
            )}
            {variations.map((v) => (
              <button
                key={v.id}
                onClick={() => { setSelected(v.id); setEditedCaption(v.caption) }}
                aria-label={`Selecionar variação ${v.label}`}
                className={`w-full rounded-md border p-3 text-left transition-colors ${selected === v.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{v.label}</Badge>
                  <span className="text-xs text-muted-foreground">{(v.hashtags || []).join(" ")}</span>
                </div>
                <p className="mt-2 text-sm">{v.caption}</p>
                <p className="mt-1 text-xs text-amber-400">CTA: {v.cta}</p>
              </button>
            ))}
            {selected && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="edited">Editar legenda</Label>
                <Textarea id="edited" rows={4} value={editedCaption} onChange={(e) => setEditedCaption(e.target.value)} aria-label="Editar legenda" />
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating} aria-label="Regenerar">
                  <Sparkles className="h-4 w-4" /> Regenerar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Agendamento inteligente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="start">Data/hora inicial (America/Sao_Paulo)</Label>
              <Input id="start" type="datetime-local" value={schedule.start} onChange={(e) => setSchedule({ ...schedule, start: e.target.value })} aria-label="Data hora inicial" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="iv">Intervalo</Label>
                <Input id="iv" type="number" min={1} value={schedule.intervalValue} onChange={(e) => setSchedule({ ...schedule, intervalValue: Number(e.target.value) })} aria-label="Intervalo" />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={schedule.intervalUnit} onValueChange={(v) => setSchedule({ ...schedule, intervalUnit: v as any })}>
                  <SelectTrigger aria-label="Unidade"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnt">Quantidade</Label>
                <Input id="cnt" type="number" min={1} max={20} value={schedule.count} onChange={(e) => setSchedule({ ...schedule, count: Number(e.target.value) })} aria-label="Quantidade" />
              </div>
            </div>
            {queue.length > 0 && (
              <div className="rounded-md border border-border bg-background/40 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Preview da fila calculada</p>
                <ul className="space-y-1 text-sm">
                  {queue.map((q) => (
                    <li key={q.n} className="flex justify-between tabular-nums">
                      <span>#{q.n}</span>
                      <span>{q.date.toLocaleString("pt-BR")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={handleAddQueue} disabled={scheduling || scheduled || variations.length === 0} className="w-full" aria-label="Adicionar à fila">
              {scheduling ? "Agendando..." : scheduled ? "Agendado ✓" : "Adicionar à fila"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
