'use client'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Loader2,
  Code2,
  Clock,
  Zap,
  ChevronRight,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  AlertCircle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { builderApi } from '@/lib/api'
import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  IN_PROGRESS: 'badge-info',
  COMPLETED:   'badge-success',
  PAUSED:      'badge-warning',
  PLANNING:    'badge-gray',
}

const STATUS_ICONS: Record<string, any> = {
  IN_PROGRESS: PlayCircle,
  COMPLETED:   CheckCircle2,
  PAUSED:      PauseCircle,
  PLANNING:    AlertCircle,
}

const PLAN_COLORS: Record<string, string> = {
  BASIC:    'bg-gray-100 text-gray-600',
  MEDIUM:   'bg-indigo-100 text-indigo-700',
  ADVANCED: 'bg-purple-100 text-purple-700',
}

export default function ProjectsPage() {
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn:  () => builderApi.listProjects(),
    select:   (res) => res.data.projects,
  })

  return (
    <div className="max-w-4xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="page-subtitle">
            All your AI-generated projects
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/builder')}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 shimmer rounded w-1/2" />
                <div className="h-3 shimmer rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!data || data.length === 0) && (
        <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Code2 className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="font-semibold text-gray-900">No projects yet</p>
          <p className="text-gray-400 text-sm max-w-sm">
            Describe what you want to build and the AI will create
            a step-by-step plan with complete code.
          </p>
          <button
            onClick={() => router.push('/dashboard/builder')}
            className="btn-primary mt-2"
          >
            <Plus className="w-4 h-4" />
            Start your first project
          </button>
        </div>
      )}

      {/* Projects list */}
      {!isLoading && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((project: any) => {
            const progressPct  = Math.round((project.currentStep / project.totalSteps) * 100)
            const StatusIcon   = STATUS_ICONS[project.status] || AlertCircle

            return (
              <div
                key={project._id}
                onClick={() => router.push(`/dashboard/builder/${project._id}`)}
                className="card p-5 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Code2 className="w-5 h-5 text-indigo-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {project.title}
                      </h3>
                      <span className={cn(
                        'badge text-[11px] shrink-0',
                        STATUS_STYLES[project.status] || 'badge-gray'
                      )}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {project.status.replace('_', ' ').toLowerCase()}
                      </span>
                      <span className={cn(
                        'badge text-[11px] shrink-0',
                        PLAN_COLORS[project.plan]
                      )}>
                        {project.plan.toLowerCase()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 truncate mb-3">
                      {project.description}
                    </p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {project.currentStep}/{project.totalSteps} steps
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelative(project.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {project.usedCredits} credits used
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-1" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}