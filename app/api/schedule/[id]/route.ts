import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function DELETE(_req: Request, ctx: any) {
  try {
    const params = typeof ctx?.params?.then === "function" ? await ctx.params : ctx?.params
    const id = params?.id
    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 })
    }
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("scheduled_posts").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, ctx: any) {
  try {
    const params = typeof ctx?.params?.then === "function" ? await ctx.params : ctx?.params
    const id = params?.id
    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 })
    }
    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("scheduled_posts").update(body).eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
