'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter }                      from 'next/navigation'
import Link                                          from 'next/link'
import {
  Clapperboard, ArrowLeft, Sparkles, Edit3, Save,
  RefreshCw, ChevronDown, ChevronUp, Play, Image as ImageIcon,
  Video, Download, CheckCircle2, Loader2, AlertCircle,
  Zap, Clock, Layers, Settings, FileText, Package,
} from 'lucide-react'
import { videoStudioApi, jobsApi } from '@/lib/api'
import { useAuthStore }             from '@/store/auth'

// ── Types ─────────────────────────────────────────────────
interface Scene {
  _id:             string
  sceneNumber:     number
  title:           string
  description:     string
  mood:            string
  narration:       string
  estimatedSeconds:number
  imagePrompt:     string
  videoPrompt:     string
  imageJobId:      string | null
  videoJobId:      string | null
  imageUrl:        string | null
  videoUrl:        string | null
  imageStatus:     'pending' | 'generating' | 'completed' | 'failed'
  videoStatus:     'pending' | 'generating' | 'completed' | 'failed'
}

interface Project {
  _id:            string
  name:           string
  channelType:    string
  style:          string
  targetAudience: string
  duration:       string
  idea:           string
  script:         string
  scenes:         Scene[]
  status:         'setup' | 'script' | 'scenes' | 'assets' | 'complete'
  creditsUsed:    number
}

const STEPS = [
  { key: 'script', label: 'Script',  icon: FileText      },
  { key: 'scenes', label: 'Scenes',  icon: Layers        },
  { key: 'assets', label: 'Assets',  icon: Video         },
  { key: 'done',   label: 'Download',icon: Download      },
]

const STEP_ORDER = ['setup','script','scenes','assets','complete']

function stepIndex(status: string) {
  const idx = STEP_ORDER.indexOf(status)
  return idx < 0 ? 0 : idx
}

// ── Asset poller hook ─────────────────────────────────────
function useAssetPoller(
  jobId:     string | null,
  projectId: string,
  sceneId:   string,
  type:      'image' | 'video',
  onDone:    (url: string) => void,
  onFail:    () => void
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!jobId) return
    timerRef.current = setInterval(async () => {
      try {
        const res = await jobsApi.get(jobId)
        const job = res.data.job
        if (job.status === 'COMPLETED') {
          clearInterval(timerRef.current!)
          const url = job.outputUrl
          // Trigger R2 save and notify backend
          try { await jobsApi.saveToR2(jobId) } catch {}
          await videoStudioApi.completeAsset(projectId, sceneId, type, url)
          onDone(url)
        } else if (job.status === 'FAILED') {
          clearInterval(timerRef.current!)
          onFail()
        }
      } catch {}
    }, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [jobId])
}

// ── Scene card ────────────────────────────────────────────
function SceneCard({
  scene, projectId, onUpdate, viewMode,
  videoSettings,
}: {
  scene:         Scene
  projectId:     string
  onUpdate:      (updated: Partial<Scene>) => void
  viewMode:      'scenes' | 'assets'
  videoSettings: { duration: number; resolution: string; enableAudio: boolean }
}) {
  const { updateUser } = useAuthStore()
  const [expanded,      setExpanded]      = useState(false)
  const [editing,       setEditing]       = useState(false)
  const [editData,      setEditData]      = useState({ ...scene })
  const [saving,        setSaving]        = useState(false)
  const [imgJobId,      setImgJobId]      = useState<string | null>(scene.imageJobId)
  const [vidJobId,      setVidJobId]      = useState<string | null>(scene.videoJobId)
  const [imgStatus,     setImgStatus]     = useState(scene.imageStatus)
  const [vidStatus,     setVidStatus]     = useState(scene.videoStatus)
  const [imgUrl,        setImgUrl]        = useState(scene.imageUrl)
  const [vidUrl,        setVidUrl]        = useState(scene.videoUrl)
  const [genImgLoading, setGenImgLoading] = useState(false)
  const [genVidLoading, setGenVidLoading] = useState(false)

  // Poll image job
  useAssetPoller(
    imgJobId, projectId, scene._id, 'image',
    url => { setImgUrl(url); setImgStatus('completed'); onUpdate({ imageUrl: url, imageStatus: 'completed' }) },
    ()  => { setImgStatus('failed') }
  )

  // Poll video job
  useAssetPoller(
    vidJobId, projectId, scene._id, 'video',
    url => { setVidUrl(url); setVidStatus('completed'); onUpdate({ videoUrl: url, videoStatus: 'completed' }) },
    ()  => { setVidStatus('failed') }
  )

  async function generateImage() {
    setGenImgLoading(true)
    try {
      const res = await videoStudioApi.generateImage(projectId, scene._id)
      setImgJobId(res.data.jobId)
      setImgStatus('generating')
    } catch (e: any) {
      alert(e.response?.data?.error || 'Image generation failed')
    } finally {
      setGenImgLoading(false)
    }
  }

  async function generateVideo() {
    if (scene.imageStatus !== 'completed') {
      alert('Generate and wait for the image first — the video will animate from it.')
      return
    }
    setGenVidLoading(true)
    try {
      const res = await videoStudioApi.generateVideo(projectId, scene._id, videoSettings)
      setVidJobId(res.data.jobId)
      setVidStatus('generating')
    } catch (e: any) {
      alert(e.response?.data?.error || 'Video generation failed')
    } finally {
      setGenVidLoading(false)
    }
  }

  async function saveEdits() {
    setSaving(true)
    try {
      await videoStudioApi.updateScene(projectId, scene._id, {
        title:       editData.title,
        description: editData.description,
        mood:        editData.mood,
        narration:   editData.narration,
        imagePrompt: editData.imagePrompt,
        videoPrompt: editData.videoPrompt,
      })
      onUpdate(editData)
      setEditing(false)
    } catch {
      alert('Failed to save edits')
    } finally {
      setSaving(false)
    }
  }

  const imgDone = imgStatus === 'completed'
  const vidDone = vidStatus === 'completed'

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      {/* Header row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
          {scene.sceneNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{scene.title}</p>
          <p className="text-xs text-gray-400">{scene.mood} · ~{scene.estimatedSeconds}s</p>
        </div>

        {/* Status badges */}
        {viewMode === 'assets' && (
          <div className="flex items-center gap-2 mr-2">
            {imgDone
              ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />img</span>
              : imgStatus === 'generating'
                ? <span className="flex items-center gap-1 text-xs text-blue-500"><Loader2 className="w-3.5 h-3.5 animate-spin" />img</span>
                : <span className="text-xs text-gray-400">img</span>
            }
            {vidDone
              ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />vid</span>
              : vidStatus === 'generating'
                ? <span className="flex items-center gap-1 text-xs text-blue-500"><Loader2 className="w-3.5 h-3.5 animate-spin" />vid</span>
                : <span className="text-xs text-gray-400">vid</span>
            }
          </div>
        )}

        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          {editing ? (
            /* Edit mode */
            <div className="space-y-3">
              {[
                { label: 'Title',        key: 'title',       rows: 1 },
                { label: 'Description',  key: 'description', rows: 2 },
                { label: 'Mood',         key: 'mood',        rows: 1 },
                { label: 'Narration',    key: 'narration',   rows: 3 },
                { label: 'Image Prompt', key: 'imagePrompt', rows: 3 },
                { label: 'Video Prompt', key: 'videoPrompt', rows: 3 },
              ].map(({ label, key, rows }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                  <textarea
                    rows={rows}
                    value={(editData as any)[key]}
                    onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={saveEdits} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Narration</p>
                <p className="text-sm text-gray-700 leading-relaxed">{scene.narration}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-600">{scene.description}</p>
              </div>
              {viewMode !== 'assets' && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Image Prompt</p>
                    <p className="text-sm text-gray-600 font-mono leading-relaxed">{scene.imagePrompt}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Video Prompt</p>
                    <p className="text-sm text-gray-600 font-mono leading-relaxed">{scene.videoPrompt}</p>
                  </div>
                </>
              )}
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-semibold">
                <Edit3 className="w-3.5 h-3.5" /> Edit scene
              </button>
            </div>
          )}

          {/* Asset generation area */}
          {viewMode === 'assets' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              {/* Image */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Image <span className="text-gray-300">·</span> 4 cr
                </p>
                {imgDone && imgUrl ? (
                  <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                    <img src={imgUrl} alt="Scene" className="w-full h-full object-cover" />
                  </div>
                ) : imgStatus === 'generating' ? (
                  <div className="rounded-xl aspect-video bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    <p className="text-xs text-gray-400">Generating…</p>
                  </div>
                ) : imgStatus === 'failed' ? (
                  <div className="space-y-2">
                    <div className="rounded-xl aspect-video bg-red-50 border border-red-200 flex items-center justify-center">
                      <p className="text-xs text-red-500">Failed</p>
                    </div>
                    <button onClick={generateImage} disabled={genImgLoading}
                      className="w-full py-2 rounded-lg text-xs font-semibold text-white"
                      style={{ background: '#EF4444' }}>
                      Retry
                    </button>
                  </div>
                ) : (
                  <button onClick={generateImage} disabled={genImgLoading}
                    className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    {genImgLoading
                      ? <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                      : <><ImageIcon className="w-6 h-6 text-gray-300" /><span className="text-xs text-gray-400">Generate (4cr)</span></>
                    }
                  </button>
                )}
              </div>

              {/* Video */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" /> Video <span className="text-gray-300">·</span> 50 cr
                </p>
                {vidDone && vidUrl ? (
                  <div className="rounded-xl overflow-hidden aspect-video bg-gray-900">
                    <video src={vidUrl} controls className="w-full h-full object-cover" />
                  </div>
                ) : vidStatus === 'generating' ? (
                  <div className="rounded-xl aspect-video bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <p className="text-xs text-gray-400">Generating… (2–5 min)</p>
                  </div>
                ) : vidStatus === 'failed' ? (
                  <div className="space-y-2">
                    <div className="rounded-xl aspect-video bg-red-50 border border-red-200 flex items-center justify-center">
                      <p className="text-xs text-red-500">Failed</p>
                    </div>
                    <button onClick={generateVideo} className="w-full py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#EF4444' }}>Retry</button>
                  </div>
                ) : (
                  <button onClick={generateVideo} disabled={genVidLoading || scene.imageStatus !== 'completed'}
                    className="w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors"
                    style={{ borderColor: scene.imageStatus === 'completed' ? '#93C5FD' : '#E5E7EB', cursor: scene.imageStatus !== 'completed' ? 'not-allowed' : 'pointer' }}
                    title={scene.imageStatus !== 'completed' ? 'Generate image first' : 'Generate video from image'}
                  >
                    {genVidLoading
                      ? <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      : scene.imageStatus !== 'completed'
                        ? <><Video className="w-6 h-6 text-gray-200" /><span className="text-xs text-gray-300">Image first → then video</span></>
                        : <><Video className="w-6 h-6 text-blue-400" /><span className="text-xs text-blue-500 font-medium">Animate image (50cr)</span></>
                    }
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main workspace ─────────────────────────────────────────
export default function VideoStudioWorkspacePage() {
  const { id }        = useParams<{ id: string }>()
  const router        = useRouter()
  const { updateUser} = useAuthStore()

  const [project,        setProject]        = useState<Project | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [activeStep,     setActiveStep]     = useState<string>('script')

  // Script step
  const [scriptLoading,  setScriptLoading]  = useState(false)
  const [scriptEditing,  setScriptEditing]  = useState(false)
  const [scriptDraft,    setScriptDraft]    = useState('')
  const [scriptSaving,   setScriptSaving]   = useState(false)

  // Scenes step
  const [scenesLoading,  setScenesLoading]  = useState(false)

  // Assets step
  const [videoSettings,  setVideoSettings]  = useState({ duration: 5, resolution: '720p', enableAudio: true })
  const [genAllRunning,  setGenAllRunning]  = useState(false)

  // Load project
  useEffect(() => {
    load()
  }, [id])

  async function load() {
    try {
      const res = await videoStudioApi.getProject(id)
      const p   = res.data.project as Project
      setProject(p)
      // Determine active step based on status
      if (p.status === 'setup' || p.status === 'script') setActiveStep('script')
      else if (p.status === 'scenes') setActiveStep('scenes')
      else if (p.status === 'assets') setActiveStep('assets')
      else if (p.status === 'complete') setActiveStep('done')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  // ── Script actions ─────────────────────────────────────
  async function generateScript() {
    setScriptLoading(true)
    setError('')
    try {
      const res = await videoStudioApi.generateScript(id)
      setProject(p => p ? { ...p, script: res.data.script, status: 'script', creditsUsed: (p.creditsUsed || 0) + res.data.creditsUsed } : p)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Script generation failed')
    } finally {
      setScriptLoading(false)
    }
  }

  async function saveScript() {
    setScriptSaving(true)
    try {
      await videoStudioApi.saveScript(id, scriptDraft)
      setProject(p => p ? { ...p, script: scriptDraft } : p)
      setScriptEditing(false)
    } catch {
      alert('Failed to save script')
    } finally {
      setScriptSaving(false)
    }
  }

  // ── Scene actions ──────────────────────────────────────
  async function generateScenes() {
    setScenesLoading(true)
    setError('')
    try {
      const res = await videoStudioApi.generateScenes(id)
      setProject(p => p ? { ...p, scenes: res.data.scenes, status: 'scenes', creditsUsed: (p.creditsUsed || 0) + res.data.creditsUsed } : p)
      setActiveStep('scenes')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Scene generation failed')
    } finally {
      setScenesLoading(false)
    }
  }

  // ── Generate all ───────────────────────────────────────
  async function generateAll() {
    if (!project) return
    const pendingScenes = project.scenes.filter(
      s => s.imageStatus === 'pending' || s.videoStatus === 'pending'
    )
    if (!pendingScenes.length) { alert('All scenes already generated!'); return }

    const totalCr = pendingScenes.reduce((sum, s) => {
      return sum + (s.imageStatus === 'pending' ? 4 : 0) + (s.videoStatus === 'pending' ? 50 : 0)
    }, 0)

    if (!confirm(`Generate all pending assets for ${pendingScenes.length} scenes?\nEstimated cost: ~${totalCr} credits ($${(totalCr / 20).toFixed(2)})`)) return

    setGenAllRunning(true)
    setProject(p => p ? { ...p, status: 'assets' } : p)

    for (const scene of project.scenes) {
      if (scene.imageStatus === 'pending') {
        try {
          const res = await videoStudioApi.generateImage(id, scene._id)
          updateSceneField(scene._id, { imageJobId: res.data.jobId, imageStatus: 'generating' })
        } catch {}
      }
      await new Promise(r => setTimeout(r, 500))
      if (scene.videoStatus === 'pending') {
        try {
          const res = await videoStudioApi.generateVideo(id, scene._id, videoSettings)
          updateSceneField(scene._id, { videoJobId: res.data.jobId, videoStatus: 'generating' })
        } catch {}
      }
      await new Promise(r => setTimeout(r, 1000))
    }

    setGenAllRunning(false)
  }

  function updateSceneField(sceneId: string, data: Partial<Scene>) {
    setProject(p => {
      if (!p) return p
      return {
        ...p,
        scenes: p.scenes.map(s => s._id === sceneId ? { ...s, ...data } : s),
      }
    })
  }

  // ── Download helpers ──────────────────────────────────
  function downloadText(content: string, filename: string) {
    const a = document.createElement('a')
    a.href  = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    a.download = filename
    a.click()
  }

  function downloadScript() {
    if (!project?.script) return
    downloadText(project.script, `${project.name}-script.txt`)
  }

  function downloadPrompts() {
    if (!project) return
    const lines = project.scenes.map(s =>
      `SCENE ${s.sceneNumber}: ${s.title}\n\nIMAGE PROMPT:\n${s.imagePrompt}\n\nVIDEO PROMPT:\n${s.videoPrompt}\n\n${'─'.repeat(60)}`
    ).join('\n\n')
    downloadText(lines, `${project.name}-prompts.txt`)
  }

  // ── Render ────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Clapperboard className="w-10 h-10 mx-auto mb-3 animate-pulse" style={{ color: '#7B2FBE' }} />
        <p className="text-gray-500">Loading project…</p>
      </div>
    </div>
  )

  if (error && !project) return (
    <div className="p-8 text-center">
      <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
      <p className="text-red-600 mb-4">{error}</p>
      <Link href="/dashboard/video-studio" className="text-purple-600 underline text-sm">Back to projects</Link>
    </div>
  )

  if (!project) return null

  const completedImages = project.scenes.filter(s => s.imageStatus === 'completed').length
  const completedVideos = project.scenes.filter(s => s.videoStatus === 'completed').length
  const totalScenes     = project.scenes.length

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left sidebar ──────────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard/video-studio" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All projects
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
              <Clapperboard className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{project.name}</p>
              <p className="text-xs text-gray-400">{project.channelType}</p>
            </div>
          </div>
        </div>

        {/* Step progress */}
        <div className="p-4 border-b border-gray-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Progress</p>
          {STEPS.map((step, idx) => {
            const pIdx    = stepIndex(project.status)
            const sIdx    = ['script','scenes','assets','done'].indexOf(step.key)
            const done    = pIdx > sIdx + 1 || (step.key === 'done' && project.status === 'complete')
            const current = activeStep === step.key
            const Icon    = step.icon
            return (
              <button key={step.key} onClick={() => {
                // Only allow navigating to reached steps
                if (sIdx <= pIdx - 1 || (step.key === 'done' && project.status === 'complete')) {
                  setActiveStep(step.key)
                }
              }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm transition-all mb-1"
                style={current ? { background: 'rgba(123,47,190,0.12)', color: '#7B2FBE', fontWeight: 700 } : { color: done ? '#374151' : '#9CA3AF' }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {step.label}
                {done && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-green-500" />}
              </button>
            )
          })}
        </div>

        {/* Project info */}
        <div className="p-4 space-y-3 text-xs text-gray-500 flex-1">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span className="capitalize">{project.duration} episode</span>
          </div>
          {totalScenes > 0 && (
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{totalScenes} scenes</span>
            </div>
          )}
          {totalScenes > 0 && (
            <div>
              <div className="flex justify-between mb-1">
                <span>Images {completedImages}/{totalScenes}</span>
                <span>Videos {completedVideos}/{totalScenes}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${totalScenes ? ((completedImages + completedVideos) / (totalScenes * 2)) * 100 : 0}%`, background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" style={{ color: '#7B2FBE' }} />
            <span style={{ color: '#7B2FBE' }} className="font-semibold">{project.creditsUsed} credits used</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8">
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── STEP: Script ─────────────────────────── */}
        {activeStep === 'script' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Script</h2>
            <p className="text-sm text-gray-500 mb-6">AI writes the full script for your episode based on your idea.</p>

            {!project.script ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to write your script?</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Claude Sonnet 4 will write a complete script with scene markers, narration and visual directions. Cost: <strong>10 credits</strong>.</p>
                <button onClick={generateScript} disabled={scriptLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)', boxShadow: '0 4px 14px rgba(123,47,190,0.3)' }}
                >
                  {scriptLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating script…</>
                    : <><Sparkles className="w-4 h-4" /> Generate Script (10 cr)</>
                  }
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {!scriptEditing ? (
                    <>
                      <button onClick={() => { setScriptDraft(project.script); setScriptEditing(true) }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={generateScript} disabled={scriptLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                        {scriptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Regenerate (10 cr)
                      </button>
                      <div className="ml-auto">
                        <button onClick={generateScenes} disabled={scenesLoading}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                          style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}
                        >
                          {scenesLoading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Breaking into scenes…</>
                            : <><Layers className="w-4 h-4" /> Generate Scenes (5 cr)</>
                          }
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button onClick={saveScript} disabled={scriptSaving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
                        {scriptSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                      <button onClick={() => setScriptEditing(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600">Cancel</button>
                    </>
                  )}
                </div>

                {scriptEditing ? (
                  <textarea
                    value={scriptDraft}
                    onChange={e => setScriptDraft(e.target.value)}
                    className="w-full h-[600px] px-5 py-4 rounded-2xl border border-gray-200 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono max-h-[600px] overflow-y-auto">
                    {project.script}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP: Scenes ─────────────────────────── */}
        {activeStep === 'scenes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Scenes</h2>
                <p className="text-sm text-gray-500">{project.scenes.length} scenes · Review and edit each scene before generating assets.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={generateScenes} disabled={scenesLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  {scenesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerate (5 cr)
                </button>
                <button onClick={() => { setProject(p => p ? { ...p, status: 'assets' } : p); setActiveStep('assets') }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
                  <Video className="w-4 h-4" /> Generate Assets →
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {project.scenes.map(scene => (
                <SceneCard
                  key={scene._id}
                  scene={scene}
                  projectId={id}
                  onUpdate={data => updateSceneField(scene._id, data)}
                  viewMode="scenes"
                  videoSettings={videoSettings}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: Assets ─────────────────────────── */}
        {activeStep === 'assets' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Assets</h2>
                <p className="text-sm text-gray-500">{completedImages}/{totalScenes} images · {completedVideos}/{totalScenes} videos</p>
              </div>
              <button onClick={generateAll} disabled={genAllRunning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)', boxShadow: '0 4px 14px rgba(123,47,190,0.25)' }}>
                {genAllRunning
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><Sparkles className="w-4 h-4" /> Generate All (~{project.scenes.filter(s => s.imageStatus==='pending').length * 4 + project.scenes.filter(s => s.videoStatus==='pending').length * 50} cr)</>
                }
              </button>
            </div>

            {/* Settings bar */}
            <div className="flex items-center gap-4 p-4 mb-5 rounded-xl bg-gray-50 border border-gray-200">
              <Settings className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">Duration</label>
                <select value={videoSettings.duration} onChange={e => setVideoSettings(v => ({ ...v, duration: +e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                  {[3,5,7,10].map(d => <option key={d} value={d}>{d}s</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">Resolution</label>
                <select value={videoSettings.resolution} onChange={e => setVideoSettings(v => ({ ...v, resolution: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">Audio</label>
                <input type="checkbox" checked={videoSettings.enableAudio} onChange={e => setVideoSettings(v => ({ ...v, enableAudio: e.target.checked }))} />
              </div>
              <div className="ml-auto text-xs text-gray-400">
                Estimated per-scene cost: 4cr image + 50cr video = <strong>54 credits</strong>
              </div>
            </div>

            {totalScenes === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p>No scenes yet. Go back to Scenes step to generate them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.scenes.map(scene => (
                  <SceneCard
                    key={scene._id}
                    scene={scene}
                    projectId={id}
                    onUpdate={data => updateSceneField(scene._id, data)}
                    viewMode="assets"
                    videoSettings={videoSettings}
                  />
                ))}
              </div>
            )}

            {totalScenes > 0 && completedImages === totalScenes && completedVideos === totalScenes && (
              <div className="mt-6 p-5 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg,rgba(123,47,190,0.08),rgba(79,142,247,0.08))', border: '1px solid rgba(123,47,190,0.2)' }}>
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="font-semibold text-gray-900 mb-3">All assets generated! 🎉</p>
                <button onClick={() => setActiveStep('done')} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
                  Go to Download →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: Download ───────────────────────── */}
        {activeStep === 'done' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Download</h2>
            <p className="text-sm text-gray-500 mb-8">Your episode is ready. Download all your assets.</p>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Scenes',        value: totalScenes,      icon: Layers },
                { label: 'Credits used',  value: project.creditsUsed, icon: Zap },
                { label: 'Images ready',  value: completedImages,  icon: ImageIcon },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1.5 text-gray-400" />
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Download buttons */}
            <div className="space-y-3 max-w-sm">
              <button onClick={downloadScript}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Download Script</p>
                  <p className="text-xs text-gray-400">Plain text file (.txt)</p>
                </div>
                <Download className="w-4 h-4 text-gray-300 ml-auto" />
              </button>

              <button onClick={downloadPrompts}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left">
                <Sparkles className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Download All Prompts</p>
                  <p className="text-xs text-gray-400">Image + video prompts for all scenes</p>
                </div>
                <Download className="w-4 h-4 text-gray-300 ml-auto" />
              </button>

              <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center">
                <Package className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">To download images and videos, right-click each one in the Assets step.</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Link href="/dashboard/video-studio/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
                <Clapperboard className="w-4 h-4" /> Create New Episode
              </Link>
              <Link href="/dashboard/video-studio"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                ← Back to Projects
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
