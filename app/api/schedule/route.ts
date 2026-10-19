import { NextResponse } from "next/server"
import { createScheduledPosts } from "@/app/actions/schedule"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const fd = await req.formData()
    const supabase = (await import("@/lib/supabase/server")).getSupabaseAdmin()
    const mediaHint = fd.get("caption")?.toString() || ""
    // dedup: prevent scheduling same caption+network combo if a scheduled post exists in last 10 min
    const { data: existing } = await supabase
      .from("scheduled_posts")
      .select("id")
      .eq("caption", mediaHint)
      .eq("status", "scheduled")
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: false, error: "Esta mídia já foi agendada recentemente. Aguarde ou altere a legenda." })
    }
    const res = await createScheduledPosts(fd)
    return NextResponse.json(res)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 500 })
  }
}
