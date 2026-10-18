import { QueueView } from "@/components/queue/queue-view"

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Fila de publicação</h1>
        <p className="text-sm text-muted-foreground">Acompanhe e gerencie publicações automáticas</p>
      </div>
      <QueueView />
    </div>
  )
}
