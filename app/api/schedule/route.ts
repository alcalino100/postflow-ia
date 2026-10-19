import { NextResponse } from "next/server"
import { createScheduledPosts } from "@/app/actions/schedule"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const fd = await req.formData()
    const res = await createScheduledPosts(fd)
    return NextResponse.json(res)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 500 })
  }
}
