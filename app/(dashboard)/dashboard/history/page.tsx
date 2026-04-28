'use client'
import { useState } from 'react'
import {
  ImageIcon,
  Video,
  Globe,
  Download,
  Clock,
  Filter,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api'
import { formatRelative, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TYPE_FILTERS   = ['ALL', 'IMAGE', 'VIDEO', 'WEBSITE']
const STATUS_FILTERS = ['ALL', 'COMPLETED', 'PROCESSING', 'FAILED', 'PENDING']

const TYPE_ICON: Record<string, any> = {
  IMAGE:   ImageIcon,
  VIDEO:   Video,
  WEBSITE: Globe,
}

const TYPE_COLOR: Record<string, string> = {
  IMAGE:   'bg-violet-100 text-violet-700',
  VIDEO:   'bg-rose-100 text-rose-700',
  WEBSITE: 'bg-emerald-100 text-emerald-700',
}

const STATUS_COLOR: Record<string, string> = {
  COMPLETED:  'badge-success',
  FAILED:     'badge-error',
  PROCESSING: 'badge-warning',
  PENDING:    'badge-gray',
}

export default function HistoryPage() {
  const [typeFilter,   setTypeFilter]   = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page,         setPage]         = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', typeFilter, statusFilter, page],
    queryFn:  () => jobsApi.list({
      type:   typeFilter   !== 'ALL' ? typeFilter   : undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      page,
    }),
    select: (res) => res.data,
  })

  const handleDownload = async (url: string, type: string) => {
    try {
      const response = await fetch(url)
      const blob     = await response.blob()
      const a        = document.createElement('a')
      a.href         = URL.createObjectURL(blob)
      a.download     = `studio42-${Date.now()}.${type === 'VIDEO' ? 'mp4' : 'webp'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="max-w-4xl space-y-5">

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />

        {/* Type filter */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setTypeFilter(f); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                typeFilter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {f === 'ALL' ? 'All types' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                statusFilter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {f === 'ALL' ? 'All status' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 flex gap-4">
              <div className="w-16 h-16 rounded-xl shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 shimmer rounded w-2/3" />
                <div className="h-3 shimmer rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && data?.jobs?.length === 0 && (
        <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-900 font-medium text-sm">
            No generations found
          </p>
          <p className="text-gray-400 text-xs">
            Try changing the filters or generate something new
          </p>
        </div>
      )}

      {/* ── Jobs list ── */}
      {!isLoading && data?.jobs?.length > 0 && (
        <div className="space-y-3">
          {data.jobs.map((job: any) => {
            const Icon = TYPE_ICON[job.type] || ImageIcon
            return (
              <div
                key={job._id}
                className="card p-4 flex gap-4 hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                  {job.status === 'COMPLETED' && job.outputUrl && job.type === 'IMAGE'
                    ? (
                      <img
                        src={job.outputUrl}
                        alt={job.prompt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-6 h-6 text-gray-300" />
                    )
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {truncate(job.prompt, 80)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {/* Type badge */}
                    <span className={cn(
                      'badge text-[11px]',
                      TYPE_COLOR[job.type]
                    )}>
                      {job.type.toLowerCase()}
                    </span>

                    {/* Status badge */}
                    <span className={cn(
                      'badge text-[11px]',
                      STATUS_COLOR[job.status] || 'badge-gray'
                    )}>
                      {job.status.toLowerCase()}
                    </span>

                    {/* Time */}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelative(job.createdAt)}
                    </span>

                    {/* Credits */}
                    <span className="text-xs text-gray-400">
                      · {job.creditsUsed} credits
                    </span>
                  </div>

                  {/* Error message */}
                  {job.status === 'FAILED' && job.errorMessage && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {job.errorMessage}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Download image or video */}
                  {job.status === 'COMPLETED' && job.outputUrl && job.type !== 'WEBSITE' && (
                    <button
                      onClick={() => handleDownload(job.outputUrl, job.type)}
                      className="btn-ghost p-2"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  {/* Open website preview */}
                  {job.status === 'COMPLETED' && job.type === 'WEBSITE' && (
                    
                     <a href={`${process.env.NEXT_PUBLIC_API_URL}/website/preview/public/${job._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost p-2"
                      title="Preview website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {data?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="btn-secondary text-xs py-2 px-4"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {data.pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === data.pagination.pages}
            className="btn-secondary text-xs py-2 px-4"
          >
            Next
          </button>
        </div>
      )}

    </div>
  )
}