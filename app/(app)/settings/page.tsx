import { SettingsView } from "@/components/settings/settings-view"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Conexões, IA e regras de agendamento</p>
      </div>
      <SettingsView />
    </div>
  )
}
