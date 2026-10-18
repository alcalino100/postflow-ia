"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  ListOrdered,
  Images,
  BarChart3,
  Settings,
  Menu,
  Plus,
  ChevronDown,
  CircleCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/queue", label: "Fila de publicação", icon: ListOrdered },
  { href: "/media", label: "Biblioteca de mídia", icon: Images },
  { href: "/reports", label: "Relatórios", icon: BarChart3 },
  { href: "/settings", label: "Configurações", icon: Settings },
]

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  return (
    <aside className={cn("flex h-screen w-60 flex-col border-r border-border bg-sidebar", className)}>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-heading font-bold">
          P
        </div>
        <span className="font-heading text-lg font-semibold tracking-tight">PostFlow IA</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href === "/media" ? "#" : item.href}
              aria-label={item.label}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="rounded-md bg-sidebar-accent/40 p-3 text-xs text-muted-foreground">
          Token Meta: <span className="text-emerald-400 font-medium">Conectado</span>
        </div>
      </div>
    </aside>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button>} />
            <SheetContent side="left" className="p-0 w-60">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Conta Meta:</span>
            <button
              type="button"
              aria-label="Selecionar conta Meta conectada"
              className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              Garcia Tráfego
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
              <CircleCheck className="h-3 w-3" /> Token válido
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/composer">
              <Button size="sm" aria-label="Novo agendamento">
                <Plus className="h-4 w-4" />
                Novo agendamento
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
