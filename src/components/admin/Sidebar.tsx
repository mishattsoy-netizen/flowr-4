'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Cpu,
  ShieldCheck,
  Users,
  Zap,
  Activity,
  Settings,
  ChevronDown,
  Smartphone,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SHARED_ITEMS = [
  { name: 'Vault', href: '/admin/vault', icon: ShieldCheck },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Presets', href: '/admin/presets', icon: Zap },
  { name: 'Analytics', href: '/admin/analytics', icon: Activity },
]

const APP_ITEMS = [
  { name: 'Router', href: '/admin/app/router', icon: Cpu },
]

const TELEGRAM_ITEMS = [
  { name: 'Router', href: '/admin/telegram/router', icon: Cpu },
]

function NavLink({ href, icon: Icon, name }: { href: string; icon: any; name: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 px-5 py-4 rounded-medium group text-[13px] font-bold border",
        isActive
          ? "bg-accent/10 text-accent border-accent/20 shadow-[inset_0_0_20px_rgba(224,153,82,0.02)]"
          : "text-bone-60 hover:text-bone-100 hover:bg-bone-hover border-transparent"
      )}
    >
      <Icon
        className={cn("w-5 h-5", isActive ? "text-accent" : "text-bone-60 group-hover:text-bone-100")}
        strokeWidth={1.5}
      />
      <span className={cn(isActive ? "tracking-tight" : "tracking-normal")}>{name}</span>
    </Link>
  )
}

function PlatformSection({
  label,
  icon: Icon,
  items,
  defaultOpen,
}: {
  label: string
  icon: any
  items: typeof APP_ITEMS
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black text-bone-60 tracking-[0.1em] uppercase hover:text-bone-100"
      >
        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="pl-4 space-y-1 mt-1">
          {items.map(item => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const isOverviewActive = pathname === '/admin'

  return (
    <div className="w-72 bg-panel flex flex-col h-full border-r border-white/5 relative z-50">
      <div className="p-10 flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center p-2 rounded-regular border border-bone bg-background shadow-[0_0_20px_rgba(233,233,226,0.05)]">
          <img src="/Logo.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col -gap-1">
          <span className="font-black text-xl text-bone-100 tracking-tighter leading-none">Flowr AI</span>
          <span className="text-[10px] font-black text-bone-60 tracking-[0.05em] mt-1">Admin Suite</span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-4 overflow-y-auto">
        {/* Overview */}
        <NavLink href="/admin" icon={LayoutGrid} name="Overview" />

        {/* Platform sections */}
        <div className="pt-2 space-y-1">
          <PlatformSection
            label="App"
            icon={Smartphone}
            items={APP_ITEMS}
            defaultOpen={pathname.startsWith('/admin/app')}
          />
          <PlatformSection
            label="Telegram Bot"
            icon={Bot}
            items={TELEGRAM_ITEMS}
            defaultOpen={pathname.startsWith('/admin/telegram')}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-3" />

        {/* Shared sections */}
        <div className="space-y-1">
          <div className="text-[10px] font-black text-bone-60 tracking-[0.1em] mb-2 px-4 uppercase opacity-50">Shared</div>
          {SHARED_ITEMS.map(item => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </nav>

      <div className="p-8 border-t border-white/5 bg-background/20">
        <Link
          href="/admin/settings"
          className="flex items-center gap-4 px-5 py-3 text-[13px] font-bold text-bone-60 rounded-medium hover:text-bone-100 hover:bg-bone-hover group"
        >
          <Settings className="w-5 h-5 text-bone-60 group-hover:text-bone-100" strokeWidth={1.5} />
          Settings node
        </Link>
      </div>
    </div>
  )
}
