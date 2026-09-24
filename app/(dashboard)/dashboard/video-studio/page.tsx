'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import {
  Clapperboard, Plus, Trash2, ArrowRight,
  Film, Clock, Layers, Zap, AlertCircle,
} from 'lucide-react'
import { videoStudioApi } from '@/lib/api'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  setup:    { label: 'Setup',        color: '#9CA3AF' },
  script:   { label: 'Script ready', color: '#3B82F6' },
  scenes:   { label: 'Scenes ready', color: '#8B5CF6' },
  assets:   { label: 'Generating',   color: '#F59E0B' },
  complete: { label: 'Complete',      color: '#10B981' },
}

const CHANNEL_ICONS: Record<string, string> = {
  'Kids Animation': '🎨', 'Educational': '📚', 'Documentary': '🎬',
  'Explainer': '💡', 'Top 10': '🏆', 'True Crime': '🔍',
  'Finance': '💰', 'Travel': '✈️', 'Cooking': '🍳',
  'Motivational': '🔥', 'Tech': '💻',
}

export default function VideoStudioPage() {
  const router  = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error,    setError]    = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await videoStudioApi.listProjects()
      setProjects(res.data.projects)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this video project? This cannot be undone.')) return
    setDeleting(id)
    try {
      await videoStudioApi.deleteProject(id)
      setProjects(p => p.filter(x => x._id !== id))
    } catch {
      alert('Failed to delete project')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Clapperboard className="w-10 h-10 mx-auto mb-3 animate-pulse" style={{ color: '#7B2FBE' }} />
        <p className="text-gray-500">Loading projects…</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Video Studio</h1>
          </div>
          <p className="text-gray-500 text-sm">Create complete YouTube episodes with AI — script, scenes, images &amp; videos.</p>
        </div>
        <Link href="/dashboard/video-studio/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)', boxShadow: '0 4px 14px rgba(123,47,190,0.3)' }}
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Cost info banner */}
      <div className="flex items-center gap-4 p-4 mb-8 rounded-xl border border-purple-200 bg-purple-50">
        <Zap className="w-5 h-5 shrink-0" style={{ color: '#7B2FBE' }} />
        <div className="text-sm text-purple-800">
          <strong>Credit costs:</strong>&nbsp; Script 10cr · Scene breakdown 5cr · Image per scene 4cr · Video per scene 50cr
        </div>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,rgba(123,47,190,0.12),rgba(79,142,247,0.12))' }}>
            <Film className="w-10 h-10" style={{ color: '#7B2FBE' }} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No video projects yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Start by creating your first episode. AI will write the script, break it into scenes, and generate images &amp; videos.</p>
          <Link href="/dashboard/video-studio/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}
          >
            <Plus className="w-4 h-4" /> Create your first episode
          </Link>
        </div>
      )}

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map(p => {
          const st = STATUS_LABELS[p.status] || STATUS_LABELS.setup
          return (
            <div key={p._id} className="card rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
              {/* Top gradient bar */}
              <div className="h-1.5" style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }} />

              <div className="p-5">
                {/* Channel type */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    {CHANNEL_ICONS[p.channelType] || '🎬'} {p.channelType}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${st.color}18`, color: st.color }}>
                    {st.label}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-gray-900 mb-3 leading-tight">{p.name}</h3>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {p.scenes?.length ?? 0} scenes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {p.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {p.creditsUsed ?? 0} cr used
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/video-studio/${p._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => handleDelete(p._id)}
                    disabled={deleting === p._id}
                    className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
