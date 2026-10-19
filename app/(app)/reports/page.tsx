import { getReportData } from "@/app/actions/metrics"
import { getSupabaseAdmin } from "@/lib/supabase/server"
import { ReportsView, type ReportPayload } from "@/components/reports/reports-view"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const { metrics, posts } = await getReportData().catch(() => ({ metrics: [], posts: [] }))
  const supabase = getSupabaseAdmin()

  // KPIs
  const publications = posts.filter((p: any) => p.status === "published").length
  const reach = metrics.reduce((a: number, m: any) => a + (m.reach || 0), 0)
  const impressions = metrics.reduce((a: number, m: any) => a + (m.impressions || 0), 0)
  const engagement = metrics.reduce((a: number, m: any) => a + ((m.likes || 0) + (m.comments || 0) + (m.shares || 0) + (m.saves || 0)), 0)
  const avgEngagement = metrics.length > 0 ? +(metrics.reduce((a: number, m: any) => a + (m.engagement || 0), 0) / metrics.length).toFixed(1) : 0
  // best format
  const byFormat: Record<string, number> = {}
  for (const m of metrics) {
    const p = (m as any).scheduled_posts
    const fmt = p?.type || "post"
    byFormat[fmt] = (byFormat[fmt] || 0) + (m.engagement || 0)
  }
  const bestFormat = Object.keys(byFormat).length ? Object.entries(byFormat).sort((a, b) => b[1] - a[1])[0][0] : "—"

  const kpis = { publications, reach, impressions, engagement, avgEngagement, bestFormat }
  const kpisPrev = { publications: 0, reach: 0, impressions: 0, engagement: 0, avgEngagement: 0, bestFormat: "—" }

  // rows
  const rows = metrics.map((m: any) => {
    const p = m.scheduled_posts
    return {
      id: m.post_id,
      thumbnail: p?.media_url || "https://picsum.photos/seed/" + m.post_id + "/60/60",
      caption: p?.caption || "",
      type: p?.type || "post",
      network: p?.network || "instagram",
      date: m.date,
      reach: m.reach || 0,
      likes: m.likes || 0,
      comments: m.comments || 0,
      shares: m.shares || 0,
      saves: m.saves || 0,
      engagement: m.engagement || 0,
      metaPostId: p?.meta_post_id,
    }
  })

  // daily series
  const byDate: Record<string, { publicacoes: number; engajamento: number }> = {}
  for (const m of metrics) {
    const d = m.date
    if (!byDate[d]) byDate[d] = { publicacoes: 0, engajamento: 0 }
    byDate[d].publicacoes += 1
    byDate[d].engajamento += m.engagement || 0
  }
  const dailySeries = Object.entries(byDate).map(([date, v]) => ({ date, publicacoes: v.publicacoes, engajamento: Math.round(v.engajamento) }))

  // format series
  const formatCounts: Record<string, number> = {}
  for (const p of posts) {
    if (p.status === "published") formatCounts[p.type] = (formatCounts[p.type] || 0) + 1
  }
  const formatSeries = Object.entries(formatCounts).map(([format, value]) => ({ format, value }))

  // network series
  const netCounts: Record<string, number> = {}
  for (const p of posts) {
    if (p.status === "published") netCounts[p.network] = (netCounts[p.network] || 0) + 1
  }
  const networkSeries = Object.entries(netCounts).map(([name, value]) => ({ name: name === "instagram" ? "Instagram" : "Facebook", value }))

  // hour series
  const hourCounts: Record<string, number> = {}
  for (const p of posts) {
    if (p.status === "published") {
      const h = new Date(p.scheduled_at).getHours()
      const key = `${String(h).padStart(2, "0")}h`
      hourCounts[key] = (hourCounts[key] || 0) + 1
    }
  }
  const hourSeries = Object.entries(hourCounts).map(([hour, value]) => ({ hour, value }))

  const payload: ReportPayload = {
    kpis, kpisPrev, rows, dailySeries, formatSeries, networkSeries, hourSeries,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Performance de posts e Reels</p>
      </div>
      {publications === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Ainda não há métricas suficientes</p>
        </div>
      ) : (
        <ReportsView payload={payload} />
      )}
    </div>
  )
}
