"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { testMetaConnection } from "@/app/actions/meta"
import { testAiAction } from "@/app/actions/settings"
import { Shield, KeyRound, Sparkles, Clock } from "lucide-react"

export function SettingsView() {
  const [pageId, setPageId] = useState("")
  const [igUserId, setIgUserId] = useState("")
  const [token, setToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [status, setStatus] = useState<"idle" | "connected" | "insufficient" | "invalid">("idle")
  const [statusMsg, setStatusMsg] = useState("")
  const [testing, setTesting] = useState(false)

  const [model, setModel] = useState("claude-3-5-sonnet-20241022")
  const [systemPrompt, setSystemPrompt] = useState("Você é um social media brasileiro...")
  const [tone, setTone] = useState("Profissional")
  const [lang, setLang] = useState("pt-BR")
  const [hashtags, setHashtags] = useState(8)
  const [defaultCta, setDefaultCta] = useState("Saiba mais")
  const [testingAi, setTestingAi] = useState(false)

  const [minInterval, setMinInterval] = useState(30)
  const [allowedHours, setAllowedHours] = useState("08:00-20:00")
  const [tz, setTz] = useState("America/Sao_Paulo")
  const [autoPause, setAutoPause] = useState(true)
  const [manualReview, setManualReview] = useState(false)

  const [sensitiveLog] = useState([
    { at: "2026-10-18 09:12", action: "Token Meta atualizado" },
    { at: "2026-10-17 14:30", action: "System prompt editado" },
  ])

  const handleTestMeta = async () => {
    setTesting(true)
    try {
      const res = await testMetaConnection(pageId, igUserId, token)
      const fbOk = res.facebook?.ok
      const igOk = res.instagram?.ok
      if (fbOk && (igUserId ? igOk : true)) {
        setStatus("connected")
        setStatusMsg(`Conectado: ${res.facebook?.name || pageId}${res.instagram?.name ? " / " + res.instagram.name : ""}`)
        toast.success("Conexão válida")
      } else if (res.facebook?.error?.toLowerCase().includes("permission")) {
        setStatus("insufficient")
        setStatusMsg(res.facebook.error)
      } else {
        setStatus("invalid")
        setStatusMsg(res.facebook?.error || res.instagram?.error || "Token inválido")
      }
    } catch (e: any) {
      setStatus("invalid")
      setStatusMsg(e?.message || "Erro")
    } finally {
      setTesting(false)
    }
  }

  const handleTestAi = async () => {
    setTestingAi(true)
    try {
      const res = await testAiAction(model, systemPrompt)
      if (res.ok) toast.success("IA respondeu com sucesso")
      else toast.error(res.error || "Falha na IA")
    } finally {
      setTestingAi(false)
    }
  }

  const revoke = () => {
    setPageId("")
    setIgUserId("")
    setToken("")
    setStatus("idle")
    setStatusMsg("")
    toast.success("Credenciais revogadas (mock)")
  }

  const statusColor = status === "connected" ? "text-emerald-400" : status === "insufficient" ? "text-amber-400" : status === "invalid" ? "text-red-400" : "text-muted-foreground"

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Meta connection */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Conexão Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="pageId">Page ID</Label>
            <Input id="pageId" value={pageId} onChange={(e) => setPageId(e.target.value)} aria-label="Page ID" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="igId">Instagram Business Account ID</Label>
            <Input id="igId" value={igUserId} onChange={(e) => setIgUserId(e.target.value)} aria-label="Instagram Business Account ID" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Page Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                aria-label="Page Access Token"
              />
              <Button variant="outline" size="sm" onClick={() => setShowToken(!showToken)} aria-label="Mostrar token">
                {showToken ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Permissões necessárias: pages_show_list, pages_read_engagement, pages_manage_posts
          </p>
          <div className="flex gap-2">
            <Button onClick={handleTestMeta} disabled={testing} aria-label="Testar conexão">
              {testing ? "Testando..." : "Testar conexão"}
            </Button>
            <Button variant="destructive" onClick={revoke} aria-label="Revogar credenciais">Revogar credenciais</Button>
          </div>
          {status !== "idle" && (
            <p className={`text-sm font-medium ${statusColor}`}>
              Status: {status === "connected" ? "Conectado" : status === "insufficient" ? "Permissão insuficiente" : "Token inválido"} — {statusMsg}
            </p>
          )}
          {status === "idle" && <p className="text-sm text-muted-foreground">Nenhuma conta Meta conectada</p>}
        </CardContent>
      </Card>

      {/* Claude IA */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Claude IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Modelo Claude</Label>
            <Select value={model} onValueChange={(v) => setModel(v ?? model)}>
              <SelectTrigger aria-label="Modelo Claude"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-5-sonnet-20241022">claude-3-5-sonnet</SelectItem>
                <SelectItem value="claude-3-haiku-20240307">claude-3-haiku</SelectItem>
                <SelectItem value="claude-opus-4-20250514">claude-opus-4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sp">System prompt padrão</Label>
            <Textarea id="sp" rows={4} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} aria-label="System prompt" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tone">Tom de voz padrão</Label>
              <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)} aria-label="Tom de voz padrão" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lang">Idioma</Label>
              <Input id="lang" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Idioma" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ht">Quantidade de hashtags</Label>
              <Input id="ht" type="number" value={hashtags} onChange={(e) => setHashtags(Number(e.target.value))} aria-label="Quantidade de hashtags" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta">CTA padrão</Label>
              <Input id="cta" value={defaultCta} onChange={(e) => setDefaultCta(e.target.value)} aria-label="CTA padrão" />
            </div>
          </div>
          <Button onClick={handleTestAi} disabled={testingAi} aria-label="Testar IA">
            {testingAi ? "Testando..." : "Testar IA"}
          </Button>
        </CardContent>
      </Card>

      {/* Scheduling rules */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Regras de agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="mi">Intervalo mínimo entre publicações (min)</Label>
            <Input id="mi" type="number" value={minInterval} onChange={(e) => setMinInterval(Number(e.target.value))} aria-label="Intervalo mínimo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ah">Horários permitidos por dia</Label>
            <Input id="ah" value={allowedHours} onChange={(e) => setAllowedHours(e.target.value)} aria-label="Horários permitidos" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tz">Timezone padrão</Label>
            <Input id="tz" value={tz} onChange={(e) => setTz(e.target.value)} aria-label="Timezone" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ap">Pausar fila automaticamente se houver falha consecutiva</Label>
            <Switch id="ap" checked={autoPause} onCheckedChange={setAutoPause} aria-label="Pausar fila automaticamente" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="mr">Revisão manual antes de publicar</Label>
            <Switch id="mr" checked={manualReview} onCheckedChange={setManualReview} aria-label="Revisão manual" />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Tokens mascarados. Últimas ações sensíveis:</p>
          <ul className="space-y-1 text-sm">
            {sensitiveLog.map((l, i) => (
              <li key={i} className="flex justify-between rounded-md border border-border px-3 py-2">
                <span>{l.action}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{l.at}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={() => toast.success("Token de teste validado (mock)")} aria-label="Testar token mascarado">
            Validar token
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
