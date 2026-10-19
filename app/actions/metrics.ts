"use server"

import { getSupabaseAdmin } from "@/lib/supabase/server"

const TOKEN = () => process.env.META_PAGE_ACCESS_TOKEN!

export async function syncMetrics(): Promise<{ synced: number; errors: string[] }> {
  const supabase = getSupabaseAdmin()
  const { data: posts } = await supabase
    .from("scheduled_posts")
    .select("*")
    .eq("status", "published")
    .not("meta_post_id", "is", null)
  const errors: string[] = []
  let synced = 0
  for (const post of posts || []) {
    try {
      let reach = 0, impressions = 0, likes = 0, comments = 0, shares = 0, saves = 0
      if (post.network === "instagram") {
        const mediaId = post.meta_post_id
        const ins = await fetch(`https://graph.facebook.com/v19.0/${mediaId}/insights?metric=reach,likes,comments,shares,saved,total_interactions&access_token=${TOKEN()}`).then((r) => r.json())
        if (ins.data) {
          for (const m of ins.data) {
            const v = m.values?.[0]?.value ?? 0
            if (m.name === "reach") reach = v
            if (m.name === "likes") likes = v
            if (m.name === "comments") comments = v
            if (m.name === "shares") shares = v
            if (m.name === "saved") saves = v
          }
        }
        // media fields for likes/comments fallback
        const media = await fetch(`https://graph.facebook.com/v19.0/${mediaId}?fields=like_count,comments_count&access_token=${TOKEN()}`).then((r) => r.json())
        if (media.like_count != null) likes = media.like_count
        if (media.comments_count != null) comments = media.comments_count
      } else {
        const postId = post.meta_post_id
        const base = await fetch(`https://graph.facebook.com/v19.0/${postId}?fields=shares,likes.summary(true),comments.summary(true)&access_token=${TOKEN()}`).then((r) => r.json())
        likes = base.likes?.summary?.total_count ?? 0
        comments = base.comments?.summary?.total_count ?? 0
        shares = base.shares?.count ?? 0
        const ins = await fetch(`https://graph.facebook.com/v19.0/${postId}/insights?metric=post_impressions,post_impressions_unique&access_token=${TOKEN()}`).then((r) => r.json())
        if (ins.data) {
          for (const m of ins.data) {
            const v = m.values?.[0]?.value ?? 0
            if (m.name === "post_impressions") impressions = v
            if (m.name === "post_impressions_unique") reach = v
          }
        }
      }
      const engagement = reach > 0 ? +(((likes + comments + shares + saves) / reach) * 100).toFixed(2) : 0
      await supabase.from("engagement_metrics").upsert({
        post_id: post.id,
        account_id: 1,
        date: new Date().toISOString().slice(0, 10),
        reach,
        impressions,
        likes,
        comments,
        shares,
        saves,
        engagement,
      }, { onConflict: "post_id,date" })
      synced++
    } catch (e: any) {
      errors.push(`${post.id}: ${e?.message}`)
    }
  }
  return { synced, errors }
}

export async function getReportData() {
  const supabase = getSupabaseAdmin()
  const { data: metrics } = await supabase
    .from("engagement_metrics")
    .select("*, scheduled_posts(*)")
    .order("engagement", { ascending: false })
  const { data: posts } = await supabase
    .from("scheduled_posts")
    .select("*")
  return { metrics: metrics || [], posts: posts || [] }
}
