import { NextResponse } from "next/server"
import { generateCaptions } from "@/app/actions/ai"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const res = await generateCaptions(body)
    return NextResponse.json(res)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 500 })
  }
}
