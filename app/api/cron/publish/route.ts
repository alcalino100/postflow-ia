import { NextResponse } from "next/server"
import { processDuePosts } from "@/app/actions/schedule"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const result = await processDuePosts()
  return NextResponse.json({ ok: true, ...result, timestamp: new Date().toISOString() })
}

export async function POST() {
  return GET()
}
