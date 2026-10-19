export const dynamic = "force-dynamic"
import { listScheduledPosts } from "@/app/actions/schedule"
import { mockPosts } from "@/lib/mock-data"
import { QueueView } from "@/components/queue/queue-view"

export default async function QueuePage() {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight">Fila de publicação</h1>
        <p className="text-sm text-muted-foreground">Acompanhe e gerencie publicações automáticas</p>
      </div>
      <QueueView posts={posts} />
    </div>
  )
}
