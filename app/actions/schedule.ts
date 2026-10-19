"use server"

import { getSupabaseAdmin } from "@/lib/supabase/server"

export interface ScheduledRow {
  id: string
  network: string
  type: string
  caption: string | null
  media_url: string | null
  scheduled_at: string
  status: string
  meta_post_id: string | null
  error: string | null
}

export async function listScheduledPosts(): Promise<ScheduledRow[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("scheduled_posts")
    .select("*")
    .order("scheduled_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map((r: any) => ({
    id: r.id,
    network: r.network,
    type: r.type,
    caption: r.caption,
    media_url: r.media_url,
    scheduled_at: r.scheduled_at,
    status: r.status,
    meta_post_id: r.meta_post_id,
    error: r.error,
  }))
}

export async function createScheduledPosts(formData: FormData): Promise<{ ok: boolean; count?: number; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    const network = String(formData.get("network") || "instagram")
    const type = String(formData.get("contentType") || "post")
    const caption = String(formData.get("caption") || "")
    const start = String(formData.get("start") || "")
    const intervalValue = Number(formData.get("intervalValue") || 2)
    const intervalUnit = String(formData.get("intervalUnit") || "hours")
    const count = Number(formData.get("count") || 1)
    const networks = network === "both" ? ["facebook", "instagram"] : [network]

    let mediaUrl: string | null = null
    const file = formData.get("file") as File | null
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "bin"
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from("media").upload(path, file, { contentType: file.type })
      if (upErr) throw new Error(upErr.message)
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path)
      mediaUrl = pub.publicUrl
    }

    const ms = intervalUnit === "hours" ? intervalValue * 3600000 : intervalValue * 86400000
    const base = new Date(start)
    const rows: any[] = []
    for (let i = 0; i < count; i++) {
      const dt = new Date(base.getTime() + i * ms)
      for (const n of networks) {
        rows.push({
          network: n,
          type,
          caption,
          media_url: mediaUrl,
          scheduled_at: dt.toISOString(),
          status: "scheduled",
        })
      }
    }
    const { error } = await supabase.from("scheduled_posts").insert(rows)
    if (error) throw new Error(error.message)
    return { ok: true, count: rows.length }
  } catch (e: any) {
    return { ok: false, error: e?.message || "Falha ao agendar" }
  }
}

export async function processDuePosts(): Promise<{ processed: number; errors: string[] }> {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()
  const { data: due, error } = await supabase
    .from("scheduled_posts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", now)
    .limit(20)
  if (error) return { processed: 0, errors: [error.message] }
  const errors: string[] = []
  let processed = 0
  for (const post of due || []) {
    // lock: set publishing
    const { data: locked } = await supabase
      .from("scheduled_posts")
      .update({ status: "publishing" })
      .eq("id", post.id)
      .eq("status", "scheduled")
      .select()
    if (!locked || locked.length === 0) continue
    try {
      const metaPostId = await publishOne(post)
      await supabase
        .from("scheduled_posts")
        .update({ status: "published", meta_post_id: metaPostId, error: null })
        .eq("id", post.id)
      processed++
    } catch (e: any) {
      const attempts = (post.attempts || 0) + 1
      const finalFail = attempts >= 3
      await supabase
        .from("scheduled_posts")
        .update({
          status: finalFail ? "failed" : "scheduled",
          error: e?.message || "Falha",
          attempts,
        })
        .eq("id", post.id)
      errors.push(`${post.id}: ${e?.message}`)
    }
  }
  return { processed, errors }
}

async function publishOne(post: any): Promise<string> {
  const token = process.env.META_PAGE_ACCESS_TOKEN!
  const pageId = process.env.META_PAGE_ID!
  const igUserId = process.env.META_IG_USER_ID!
  if (post.network === "facebook") {
    if (post.type === "reel") {
      // Reels Publishing API flow (simplified): upload video then publish
      if (!post.media_url) throw new Error("Mídia obrigatória")
      const init = await fetch(`https://graph.facebook.com/v19.0/${pageId}/video_reels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upload_phase: "start", access_token: token }),
      }).then((r) => r.json())
      // fallback: treat as normal video post
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_url: post.media_url, description: post.caption, access_token: token }),
      }).then((r) => r.json())
      if (res.error) throw new Error(res.error.message)
      return res.id
    }
    // post
    if (post.media_url && post.media_url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: post.media_url, message: post.caption, access_token: token }),
      }).then((r) => r.json())
      if (res.error) throw new Error(res.error.message)
      return res.post_id || res.id
    }
    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: post.caption, access_token: token }),
    }).then((r) => r.json())
    if (res.error) throw new Error(res.error.message)
    return res.id
  }
  // instagram
  if (!post.media_url) throw new Error("Mídia obrigatória para Instagram")
  const isVideo = /\.(mp4|mov|webm)$/i.test(post.media_url) || post.type === "reel"
  const mediaBody: any = { caption: post.caption, access_token: token }
  if (isVideo) {
    mediaBody.media_type = post.type === "reel" ? "REELS" : "VIDEO"
    mediaBody.video_url = post.media_url
  } else {
    mediaBody.image_url = post.media_url
  }
  const container = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mediaBody),
  }).then((r) => r.json())
  if (container.error) throw new Error(container.error.message)
  // wait a bit for video processing
  if (isVideo) await new Promise((r) => setTimeout(r, 5000))
  const pub = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: container.id, access_token: token }),
  }).then((r) => r.json())
  if (pub.error) throw new Error(pub.error.message)
  return pub.id
}
