"use server"

import Anthropic from "@anthropic-ai/sdk"

export interface Briefing {
  theme: string
  audience: string
  tone: string
  objective: string
  keywords: string
  cta: string
  language: string
  variations: number
}

export interface AiVariation {
  id: string
  label: string
  caption: string
  hashtags: string[]
  cta: string
}

export async function generateCaptions(briefing: Briefing): Promise<{ ok: boolean; variations?: AiVariation[]; error?: string; tokens?: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Mock fallback so UI still works without key
    const mock: AiVariation[] = [
      { id: "v1", label: "Curta", caption: `${briefing.theme} — ${briefing.cta}. #${briefing.keywords.split(",")[0]?.trim() || "novidade"}`, hashtags: ["#novidade"], cta: briefing.cta },
      { id: "v2", label: "Média", caption: `${briefing.theme} para ${briefing.audience}. ${briefing.objective}. ${briefing.cta}.`, hashtags: ["#conteudo", "#social"], cta: briefing.cta },
      { id: "v3", label: "Storytelling", caption: `Começou com ${briefing.theme}. Hoje entregamos para ${briefing.audience}. ${briefing.cta}.`, hashtags: ["#historia", "#marca"], cta: briefing.cta },
    ]
    return { ok: true, variations: mock, tokens: 0 }
  }

  try {
    const client = new Anthropic({ apiKey })
    const model = "claude-sonnet-4-6"
    const msg = await client.messages.create({
      model,
      max_tokens: 1200,
      system:
        "Você é um social media brasileiro especialista em Instagram e Facebook. Gere legendas em português do Brasil, com hashtags relevantes e CTA. Retorne JSON válido com array 'variations' contendo objetos {label, caption, hashtags, cta}.",
      messages: [
        {
          role: "user",
          content: `Briefing:
Tema: ${briefing.theme}
Público: ${briefing.audience}
Tom: ${briefing.tone}
Objetivo: ${briefing.objective}
Palavras-chave: ${briefing.keywords}
CTA: ${briefing.cta}
Idioma: ${briefing.language}
Quantidade: ${briefing.variations}

Gere ${briefing.variations} variações: curta, média e storytelling. Cada uma com legenda, hashtags e CTA.`,
        },
      ],
    })

    const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("")
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}")
    const variations: AiVariation[] = (parsed.variations || []).map((v: any, i: number) => ({
      id: `v${i + 1}`,
      label: v.label || `Variação ${i + 1}`,
      caption: v.caption || "",
      hashtags: v.hashtags || [],
      cta: v.cta || briefing.cta,
    }))
    return { ok: true, variations, tokens: msg.usage?.input_tokens ?? 0 + (msg.usage?.output_tokens ?? 0) }
  } catch (e: any) {
    return { ok: false, error: e?.message || "Falha na Claude API" }
  }
}
