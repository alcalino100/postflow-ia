import { ComposerView } from "@/components/composer/composer-view"

export default function ComposerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Criador com IA</h1>
        <p className="text-sm text-muted-foreground">Crie posts/Reels, gere legendas com IA e agende em lote</p>
      </div>
      <ComposerView />
    </div>
  )
}
