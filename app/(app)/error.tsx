"use client"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="font-heading text-xl font-bold text-red-400">Erro na página</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">{error?.message || "Erro desconhecido"}</p>
      {error?.digest && <p className="mt-1 text-xs text-muted-foreground">digest: {error.digest}</p>}
      <button onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Tentar novamente</button>
    </div>
  )
}
