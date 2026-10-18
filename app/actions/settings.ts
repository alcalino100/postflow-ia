"use server"

import { generateCaptions } from "./ai"

export async function testAiAction(model: string, prompt: string) {
  const res = await generateCaptions({
    theme: "teste",
    audience: "geral",
    tone: "neutro",
    objective: "engajamento",
    keywords: "teste",
    cta: "Saiba mais",
    language: "pt-BR",
    variations: 1,
  })
  return res
}
