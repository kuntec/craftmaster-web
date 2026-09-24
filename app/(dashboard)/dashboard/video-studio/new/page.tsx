'use client'
export const dynamic = 'force-dynamic'

import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import Link            from 'next/link'
import { Clapperboard, ArrowLeft, ArrowRight, Zap } from 'lucide-react'
import { videoStudioApi } from '@/lib/api'

const CHANNEL_TYPES = [
  'Kids Animation','Educational','Documentary','Explainer',
  'Top 10','True Crime','Finance','Travel','Cooking',
  'Motivational','Tech',
]

const STYLE_SUGGESTIONS: Record<string, string> = {
  'Kids Animation':  'Bright, colorful cartoon style with simple shapes and bold outlines',
  'Educational':     'Clean, modern infographic style with clear diagrams and professional look',
  'Documentary':     'Cinematic, realistic photography style with dramatic lighting',
  'Explainer':       'Flat design with icons and simple animations, friendly and approachable',
  'Top 10':          'Dynamic, bold typography with vibrant colors and exciting visuals',
  'True Crime':      'Dark, moody atmosphere with dramatic shadows and noir aesthetic',
  'Finance':         'Professional, clean charts and graphs with a corporate aesthetic',
  'Travel':          'Vibrant, lush photography with warm golden-hour tones',
  'Cooking':         'Warm, inviting food photography with natural lighting and rustic tones',
  'Motivational':    'Inspiring sunrise landscapes with bold uplifting colors',
  'Tech':            'Sleek, futuristic dark theme with neon accents and circuit patterns',
}

const DURATIONS = [
  { value: 'short',  label: 'Short',  desc: '2–3 minutes', scenes: '3–5 scenes',  icon: '⚡' },
  { value: 'medium', label: 'Medium', desc: '4–6 minutes', scenes: '6–9 scenes',  icon: '🎯' },
  { value: 'long',   label: 'Long',   desc: '7–10 minutes',scenes: '10–15 scenes',icon: '🎬' },
]

export default function NewVideoProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    name:           '',
    channelType:    '',
    style:          '',
    targetAudience: '',
    duration:       'medium',
    idea:           '',
  })

  function setField(key: string, value: string) {
    setForm(f => {
      const next: any = { ...f, [key]: value }
      if (key === 'channelType' && STYLE_SUGGESTIONS[value] && !f.style) {
        next.style = STYLE_SUGGESTIONS[value]
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.channelType || !form.idea.trim()) {
      setError('Please fill in Name, Channel Type and Idea')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await videoStudioApi.createProject(form)
      router.push(`/dashboard/video-studio/${res.data.project._id}`)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to create project')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/video-studio" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)' }}>
          <Clapperboard className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">New Video Project</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8">Set up your episode — AI will handle the rest.</p>

      {/* Credit notice */}
      <div className="flex items-center gap-3 p-4 mb-8 rounded-xl bg-purple-50 border border-purple-200">
        <Zap className="w-4 h-4 shrink-0" style={{ color: '#7B2FBE' }} />
        <p className="text-sm text-purple-800">
          <strong>Cost preview:</strong> Script 10cr + Scene breakdown 5cr = <strong>15 credits total to plan your episode</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project name */}
        <div>
          <label className="label block mb-1.5 text-sm font-medium text-gray-700">Episode / Project Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            placeholder="e.g. Top 10 Space Discoveries of 2024"
            className="input w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#7B2FBE' } as any}
          />
        </div>

        {/* Channel type */}
        <div>
          <label className="label block mb-1.5 text-sm font-medium text-gray-700">Channel Type *</label>
          <select
            value={form.channelType}
            onChange={e => setField('channelType', e.target.value)}
            className="input w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 bg-white"
          >
            <option value="">Select channel type…</option>
            {CHANNEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Visual style */}
        <div>
          <label className="label block mb-1.5 text-sm font-medium text-gray-700">Visual Style</label>
          <input
            type="text"
            value={form.style}
            onChange={e => setField('style', e.target.value)}
            placeholder="Describe the look & feel of your visuals"
            className="input w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2"
          />
          {form.channelType && STYLE_SUGGESTIONS[form.channelType] && (
            <p className="text-xs text-gray-400 mt-1.5">
              Suggested: <button type="button" onClick={() => setField('style', STYLE_SUGGESTIONS[form.channelType])} className="text-purple-600 hover:underline">{STYLE_SUGGESTIONS[form.channelType]}</button>
            </p>
          )}
        </div>

        {/* Target audience */}
        <div>
          <label className="label block mb-1.5 text-sm font-medium text-gray-700">Target Audience</label>
          <input
            type="text"
            value={form.targetAudience}
            onChange={e => setField('targetAudience', e.target.value)}
            placeholder="e.g. Kids aged 5–10, Science enthusiasts, Beginners in finance"
            className="input w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="label block mb-2 text-sm font-medium text-gray-700">Episode Duration</label>
          <div className="grid grid-cols-3 gap-3">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => setField('duration', d.value)}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={form.duration === d.value ? {
                  borderColor: '#7B2FBE',
                  background:  'rgba(123,47,190,0.06)',
                } : {
                  borderColor: '#E5E7EB',
                  background:  'white',
                }}
              >
                <div className="text-xl mb-1">{d.icon}</div>
                <div className="text-sm font-bold text-gray-900">{d.label}</div>
                <div className="text-xs text-gray-500">{d.desc}</div>
                <div className="text-xs text-gray-400 mt-1">{d.scenes}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Idea */}
        <div>
          <label className="label block mb-1.5 text-sm font-medium text-gray-700">Your Idea / Topic *</label>
          <textarea
            rows={5}
            value={form.idea}
            onChange={e => setField('idea', e.target.value)}
            placeholder="Describe your video idea in detail. What's the story? What information should it cover? What's the main message? The more detail you give, the better the script."
            className="input w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1.5">{form.idea.length} characters — more detail = better script</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#7B2FBE,#4F8EF7)', boxShadow: '0 4px 14px rgba(123,47,190,0.3)' }}
        >
          {loading ? (
            <><span className="animate-spin">⚙</span> Creating project…</>
          ) : (
            <>Create Project <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>
    </div>
  )
}
