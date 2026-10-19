import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("scheduled_posts").delete().eq("id", params.id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("scheduled_posts").update(body).eq("id", params.id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
