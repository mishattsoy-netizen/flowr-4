import React from 'react'
import { Shield } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import AdminsTable from './AdminsTable'

export default async function AdminsPage() {
  const { data: admins, error } = await supabaseAdmin!
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-rose-500 font-bold font-mono">System error: {error.message}</div>
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="mb-2">
        <h1 className="text-4xl font-display font-medium text-foreground mb-1">Admin Access</h1>
        <p className="text-muted-foreground text-sm font-medium">Manage who can access the admin panel.</p>
      </div>

      <div className="bg-panel group/widget border border-[var(--bone-12)] px-5 pb-5 pt-4 rounded-[var(--radius-big)] widget-shadow h-full flex flex-col instrument-hover cursor-default transition-all duration-200">
        <div className="flex items-center justify-between mb-3 opacity-40">
          <span className="text-[10px] font-bold text-bone-70 tracking-[0.1em] uppercase">Total admins</span>
          <Shield className="w-4 h-4 text-accent" strokeWidth={2} />
        </div>
        <div className="text-3xl font-medium text-accent tracking-tighter leading-none font-display">{admins?.length || 0}</div>
      </div>

      <div className="bg-panel group/widget border border-[var(--bone-12)] px-5 pb-5 pt-4 rounded-[var(--radius-big)] widget-shadow h-full flex flex-col overflow-hidden transition-all duration-200">
        <AdminsTable initialAdmins={admins || []} />
      </div>
    </div>
  )
}
