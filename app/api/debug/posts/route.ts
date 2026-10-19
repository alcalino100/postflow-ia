import { NextResponse } from "next/server"
import { listScheduledPosts } from "@/app/actions/schedule"
export const dynamic = "force-dynamic"
export async function GET() {
  const rows = await listScheduledPosts()
  return NextResponse.json(rows)
}
