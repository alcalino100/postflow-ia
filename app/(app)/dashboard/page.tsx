import { listScheduledPosts } from "@/app/actions/schedule"
import { getSupabaseAdmin } from "@/lib/supabase/server"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { UpcomingTable } from "@/components/dashboard/upcoming-table"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  let posts: any[] = []
  try {
    const rows = await listScheduledPosts()
    posts = rows.map((r) => ({
      id: r.id,
      thumbnail: r.media_url || "https://picsum.photos/seed/" + r.id + "/80/80",
      type: r.type,
      network: r.network,
      caption: r.caption || "",
      scheduledAt: r.scheduled_at,
      status: r.status,
      metaPostId: r.meta_post_id || undefined,
      error: r.error || undefined,
    }))
  } catch {
    posts = []
  }

  // KPIs reais
  const supabase = getSupabaseAdmin()
  const now = new Date()
  const next24 = new Date(now.getTime() + 24 * 3600000).toISOString()
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length
  const reelsCount = posts.filter((p) => p.status === "scheduled" && p.type === "reel").length
  const next24hCount = posts.filter((p) => p.status === "scheduled" && p.scheduledAt <= next24 && p.scheduledAt >= now.toISOString()).length
  const { data: metrics } = await supabase.from("engagement_metrics").select("engagement")
  const avgEngagement = metrics && metrics.length > 0
    ? +(metrics.reduce((a: number, m: any) => a + (m.engagement || 0), 0) / metrics.length).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das suas publicações</p>
      </div>
      <KpiCards data={{ scheduled: scheduledCount, reels: reelsCount, next24h: next24hCount, avgEngagement }} />
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma publicação agendada</p>
        </div>
      ) : (
        <UpcomingTable posts={posts as any} />
      )}
    </div>
  )
}
