'use client'
import { useEffect, useState } from 'react'
import {
  Users, DollarSign, ImageIcon,
  TrendingUp, Video, Globe,
  Code2, Zap, ArrowUp,
} from 'lucide-react'
import { adminStatsApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'

interface Overview {
  users: {
    total: number; today: number; thisMonth: number
    paying: number; payingPct: number
  }
  revenue: {
    totalUsd: number; monthUsd: number; todayUsd: number
  }
  generations: {
    total: number; today: number
    images: number; videos: number
    websites: number; projects: number
  }
}

function StatCard({
  label, value, sub, icon: Icon, color, prefix = '',
}: {
  label: string; value: number | string; sub?: string
  icon: any; color: string; prefix?: string
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}25` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-white">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>
        )}
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const [data,    setData]    = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminStatsApi.overview()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Overview</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Loading dashboard data…
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 h-28 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Overview</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Studio42 platform analytics
        </p>
      </div>

      {/* Revenue stats */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.25)' }}>Revenue</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Revenue"   value={data.revenue.totalUsd} prefix="$" sub="All time"      icon={DollarSign} color="#10B981" />
          <StatCard label="This Month"      value={data.revenue.monthUsd} prefix="$" sub="Current month" icon={TrendingUp}  color="#4F8EF7" />
          <StatCard label="Today"           value={data.revenue.todayUsd} prefix="$" sub="Last 24 hours" icon={ArrowUp}     color="#7B2FBE" />
        </div>
      </div>

      {/* User stats */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.25)' }}>Users</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Users"    value={data.users.total}      sub="Registered"            icon={Users}      color="#4F8EF7" />
          <StatCard label="Paying Users"   value={data.users.paying}     sub={`${data.users.payingPct}% conversion`} icon={DollarSign} color="#10B981" />
          <StatCard label="Today Signups"  value={data.users.today}      sub="New today"             icon={ArrowUp}    color="#7B2FBE" />
          <StatCard label="Month Signups"  value={data.users.thisMonth}  sub="This month"            icon={TrendingUp} color="#00C2FF" />
        </div>
      </div>

      {/* Generation stats */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.25)' }}>Generations</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total',    value: data.generations.total,    icon: Zap,       color: '#C4A8FF' },
            { label: 'Today',    value: data.generations.today,    icon: ArrowUp,   color: '#34D399' },
            { label: 'Images',   value: data.generations.images,   icon: ImageIcon, color: '#7B2FBE' },
            { label: 'Videos',   value: data.generations.videos,   icon: Video,     color: '#4F8EF7' },
            { label: 'Websites', value: data.generations.websites, icon: Globe,     color: '#00C2FF' },
            { label: 'Projects', value: data.generations.projects, icon: Code2,     color: '#F59E0B' },
          ].map(s => (
            <div key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${s.color}18` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-black text-white">{s.value.toLocaleString()}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.25)' }}>Quick actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'View all users',       href: '/admin/users',       desc: `${data.users.total} registered`, color: '#4F8EF7' },
            { label: 'View all payments',    href: '/admin/payments',    desc: `$${data.revenue.totalUsd} total`, color: '#10B981' },
            { label: 'View all generations', href: '/admin/generations', desc: `${data.generations.total} total`, color: '#7B2FBE' },
          ].map(link => (
            <a key={link.href} href={link.href}
              className="rounded-2xl p-5 flex items-center justify-between group transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = `${link.color}40`; (e.currentTarget as HTMLAnchorElement).style.background = `${link.color}08` }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)' }}
            >
              <div>
                <p className="font-semibold text-white text-sm">{link.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{link.desc}</p>
              </div>
              <ArrowUp className="w-4 h-4 rotate-45 opacity-0 group-hover:opacity-100 transition-all" style={{ color: link.color }} />
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}