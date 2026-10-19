"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Sparkles,
  CalendarDays,
  Wand2,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  { icon: Wand2, title: "Legendas com IA", desc: "Claude gera 3 variações (curta, média, storytelling) com hashtags e CTA." },
  { icon: CalendarDays, title: "Agendamento em lote", desc: "Defina intervalo e quantidade; a fila é calculada automaticamente." },
  { icon: Zap, title: "Publicação automática", desc: "Cron a cada 5 min publica Posts e Reels no Facebook e Instagram." },
  { icon: BarChart3, title: "Relatórios reais", desc: "Métricas sincronizadas via Meta Graph API: alcance, engajamento, melhores horários." },
  { icon: ShieldCheck, title: "Tokens seguros", desc: "Credenciais criptografadas e nunca expostas ao client." },
  { icon: Sparkles, title: "Calendário visual", desc: "Visão mensal colorida por rede e status, com filtros avançados." },
]

const stats = [
  { value: "5 min", label: "Intervalo do scheduler" },
  { value: "3x", label: "Variações por geração" },
  { value: "2 redes", label: "Facebook + Instagram" },
  { value: "100%", label: "Dados reais da Meta" },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMove = (e: React.MouseEvent) => {
    const el = heroRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * 8, y: x * -8 })
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/60 border-b border-border/50">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold">P</div>
            <span className="font-heading text-lg font-semibold tracking-tight">PostFlow IA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Recursos</a>
            <a href="#how" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#cta" className="hover:text-foreground transition-colors">Começar</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link href="/composer"><Button size="sm">Criar agendamento</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Agendamento inteligente com IA
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Agende posts e Reels com{" "}
              <span className="text-primary">legendas geradas por IA</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Planeje, gere e publique conteúdo no Facebook e Instagram automaticamente. Claude cria as legendas, o scheduler cuida do resto.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/composer"><Button size="lg">Começar agora <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/dashboard"><Button variant="outline" size="lg">Ver dashboard</Button></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              {["Sem login nesta fase", "Dados reais da Meta", "Cron a cada 5 min"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            ref={heroRef}
            onMouseMove={handleMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
            style={{ perspective: 1200 }}
          >
            <div
              className="rounded-2xl border border-border bg-card/80 backdrop-blur shadow-2xl p-4 transition-transform duration-200"
              style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <div className="ml-3 text-xs text-muted-foreground font-mono">postflow-ia.vercel.app/dashboard</div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["12", "7", "3", "4.6%"].map((v, i) => (
                  <div key={i} className="rounded-lg border border-border bg-background/60 p-3">
                    <div className="text-[10px] text-muted-foreground">KPI {i + 1}</div>
                    <div className="text-lg font-bold tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-3 mb-3">
                <div className="text-xs text-muted-foreground mb-2">Engajamento por dia</div>
                <div className="flex items-end gap-1 h-20">
                  {[40, 65, 50, 80, 70, 90, 60, 75, 55, 85, 70, 95, 65, 88].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/70 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-2">
                    <div className="h-8 w-8 rounded bg-muted" />
                    <div className="flex-1">
                      <div className="h-2 w-2/3 bg-muted rounded" />
                      <div className="h-2 w-1/3 bg-muted/60 rounded mt-1" />
                    </div>
                    <div className="text-xs text-emerald-400">Agendado</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-3xl font-bold text-primary tabular-nums">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">Tudo que você precisa para escalar conteúdo</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Do briefing à publicação, em um único painel dark e profissional.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group rounded-xl border border-border bg-card/50 p-6 hover:border-primary/40 hover:bg-card transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-card/20 border-y border-border">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", t: "Envie a mídia", d: "Faça upload de imagem, carrossel ou vídeo MP4 e escolha rede e formato." },
              { n: "02", t: "Gere com IA", d: "Claude cria 3 variações de legenda com hashtags e CTA a partir do briefing." },
              { n: "03", t: "Agende e publique", d: "Defina intervalo e quantidade; o cron publica automaticamente a cada 5 min." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="font-mono text-5xl font-bold text-primary/20 mb-2">{s.n}</div>
                <h3 className="font-heading text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-card to-amber-500/10 p-10 md:p-16 text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">Pronto para automatizar seu conteúdo?</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Comece agora e tenha posts e Reels publicando sozinhos no Facebook e Instagram.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/composer"><Button size="lg">Criar primeiro agendamento <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/dashboard"><Button variant="outline" size="lg">Abrir dashboard</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xs">P</div>
            <span>PostFlow IA</span>
          </div>
          <div>© 2026 PostFlow IA. Dados reais via Meta Graph API.</div>
        </div>
      </footer>
    </div>
  )
}
