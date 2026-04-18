'use client'
import Link from 'next/link'
import {
  ImageIcon,
  Video,
  Globe,
  Zap,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api'
import { formatCredits, formatRelative, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TOOLS = [
  {
    href:    '/dashboard/image',
    icon:    ImageIcon,
    label:   'Image Generator',
    desc:    'Create stunning visuals from text prompts',
    cost:    '4 credits',
    color:   'bg-violet-500',
    border:  'border-violet-200',
    bg:      'bg-violet-50',
    text:    'text-violet-700',
  },
  {
    href:    '/dashboard/video',
    icon:    Video,
    label:   'Video Generator',
    desc:    'Turn prompts into cinematic video clips',
    cost:    '40 credits',
    color:   'bg-rose-500',
    border:  'border-rose-200',
    bg:      'bg-rose-50',
    text:    'text-rose-700',
  },
  {
    href:    '/dashboard/website',
    icon:    Globe,
    label:   'Website Builder',
    desc:    'Generate complete websites in seconds',
    cost:    '20 credits',
    color:   'bg-emerald-500',
    border:  'border-emerald-200',
    bg:      'bg-emerald-50',
    text:    'text-emerald-700',
  },
]

const STATUS_BADGE: Record<string, string> = {
  COMPLETED:  'badge-success',
  FAILED:     'badge-error',
  PROCESSING: 'badge-warning',
  PENDING:    'badge-gray',
}

const TYPE_ICON: Record<string, any> = {
  IMAGE:   ImageIcon,
  VIDEO:   Video,
  WEBSITE: Globe,
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: recentJobs } = useQuery({
    queryKey: ['jobs-recent'],
    queryFn:  () => jobsApi.list({ page: 1 }),
    select:   (res) => res.data.jobs.slice(0, 5),
  })

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          You have{' '}
          <span className="text-indigo-600 font-semibold">
            {formatCredits(user?.creditsBalance ?? 0)} credits
          </span>{' '}
          available.
          {(user?.creditsBalance ?? 0) < 20 && (
            <Link
              href="/dashboard/credits"
              className="text-red-500 ml-2 font-medium hover:underline"
            >
              Running low — top up →
            </Link>
          )}
        </p>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="card-hover p-5 flex flex-col gap-4 group"
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                tool.color
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                  {tool.label}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  {tool.desc}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full border',
                  tool.bg, tool.border, tool.text
                )}>
                  <Zap className="w-3 h-3 inline mr-1" />
                  {tool.cost}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent activity */}
      {recentJobs && recentJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Recent activity
            </h3>
            <Link
              href="/dashboard/history"
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="card divide-y divide-gray-100">
            {recentJobs.map((job: any) => {
              const Icon = TYPE_ICON[job.type] || ImageIcon
              return (
                <div
                  key={job._id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {truncate(job.prompt, 60)}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatRelative(job.createdAt)}
                      · {job.creditsUsed} credits
                    </p>
                  </div>
                  <span className={STATUS_BADGE[job.status] || 'badge-gray'}>
                    {job.status.toLowerCase()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentJobs && recentJobs.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium text-sm">
            No generations yet
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Pick a tool above and create something
          </p>
        </div>
      )}
    </div>
  )
}