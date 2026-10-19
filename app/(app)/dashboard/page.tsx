import { listScheduledPosts } from "@/app/actions/schedule"
import { mockPosts } from "@/lib/mock-data"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { UpcomingTable } from "@/components/dashboard/upcoming-table"

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
    posts = mockPosts
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das suas publicações</p>
      </div>
      <KpiCards />
      <UpcomingTable posts={posts as any} />
    </div>
  )
}
