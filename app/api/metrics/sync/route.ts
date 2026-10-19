import { NextResponse } from "next/server"
import { syncMetrics } from "@/app/actions/metrics"
export const dynamic = "force-dynamic"
export async function GET() {
  const r = await syncMetrics()
  return NextResponse.json(r)
}
