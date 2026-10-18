import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  // Cron a cada 5 minutos: processa scheduled_posts com status scheduled e scheduled_at <= now
  // Implementação real requer Prisma + Meta clients (lib/meta/*). Aqui retornamos resumo mock.
  const processed = 0
  return NextResponse.json({ ok: true, processed, timestamp: new Date().toISOString() })
}

export async function POST() {
  return GET()
}
