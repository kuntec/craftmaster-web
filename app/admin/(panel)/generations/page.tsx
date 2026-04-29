'use client'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, ImageIcon, Video, Globe, Code2 } from 'lucide-react'
import { adminGenerationsApi } from '@/lib/adminApi'
import { formatRelative, cn } from '@/lib/utils'

interface Job {
  _id:         string
  userId:      { name: string; email: string }
  type:        string
  prompt:      string
  status:      string
  creditsUsed: number
  outputUrl:   string
  createdAt:   string
}

const TYPE_ICONS: Record<string, any> = {
  IMAGE:   ImageIcon,
  VIDEO:   Video,
  WEBSITE: Globe,
  PROJECT: Code2,
}

const TYPE_COLORS: Record<string, string> = {
  IMAGE:   '#7B2FBE',
  VIDEO:   '#4F8EF7',
  WEBSITE: '#00C2FF',
  PROJECT: '#F59E0B',
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED:  '#34D399',
  FAILED:     '#F87171',
  PROCESSING: '#FCD34D',
  PENDING:    '#93C5FD',
}

export default function AdminGenerationsPage() {
  const [jobs,    setJobs]    = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [pages,   setPages]   = useState(1)
  const [total,   setTotal]   = useState(0)
  const [typeFilter,   setTypeFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    adminGenerationsApi.list({
      page, limit: 20,
      type:   typeFilter,
      status: statusFilter,
    })
      .then(res => {
        setJobs(res.data.jobs)
        setPages(res.data.pagination.pages)
        setTotal(res.data.pagination.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, typeFilter, statusFilter])

  return (
    <div className="space-y-5 max-w-6xl">

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Generations</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {total} total generations
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option value="">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="website">Websites</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid px-5 py-3 text-xs font-bold uppercase tracking-wider"
          style={{
            gridTemplateColumns: '1.5fr 2fr 3fr 1fr 1fr 1fr',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.3)',
          }}>
          <div>User</div>
          <div>Type</div>
          <div>Prompt</div>
          <div>Credits</div>
          <div>Status</div>
          <div>Date</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7B2FBE' }} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No generations found
          </div>
        ) : jobs.map((job, i) => {
          const Icon  = TYPE_ICONS[job.type]  || ImageIcon
          const color = TYPE_COLORS[job.type] || '#7B2FBE'
          return (
            <div key={job._id}
              className="grid items-center px-5 py-3.5"
              style={{
                gridTemplateColumns: '1.5fr 2fr 3fr 1fr 1fr 1fr',
                borderBottom: i !== jobs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-[100px]">{job.userId?.name}</p>
                <p className="text-xs truncate max-w-[100px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{job.userId?.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-sm font-medium text-white">{job.type}</span>
              </div>

              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {job.prompt || '—'}
              </p>

              <p className="text-sm font-bold" style={{ color: '#C4A8FF' }}>
                {job.creditsUsed}
              </p>

              <span className="text-xs font-semibold px-2 py-1 rounded-lg inline-block w-fit"
                style={{
                  background: `${STATUS_COLORS[job.status] || '#93C5FD'}18`,
                  color:       STATUS_COLORS[job.status] || '#93C5FD',
                }}>
                {job.status}
              </span>

              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {formatRelative(job.createdAt)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Page {page} of {pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === pages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}