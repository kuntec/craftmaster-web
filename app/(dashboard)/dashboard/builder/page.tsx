'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wand2,
  Loader2,
  AlertCircle,
  Code2,
  Lightbulb,
} from 'lucide-react'
import { builderApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

const EXAMPLES = [
  'A custom ecommerce system with products, cart, orders and payments',
  'A project management tool with tasks, teams and deadlines',
  'A booking system for appointments and scheduling',
  'A blog platform with posts, categories and comments',
  'A restaurant management system with menu and orders',
  'A real estate listing platform with search and filters',
]

const COST = 5

export default function BuilderPage() {
  const router     = useRouter()
  const updateUser = useAuthStore((s) => s.updateUser)
  const user       = useAuthStore((s) => s.user)

  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleGenerate = async () => {
    if (!description.trim() || description.trim().length < 10) return
    setLoading(true)
    setError('')

    try {
      const res = await builderApi.generatePlans(description.trim())

      // Deduct planning credits from local state
      if (user) updateUser({ creditsBalance: user.creditsBalance - COST })

      // Store plans in sessionStorage to pass to plan page
      sessionStorage.setItem('builder_plans',       JSON.stringify(res.data.plans))
      sessionStorage.setItem('builder_description', description.trim())

      router.push('/dashboard/builder/plan')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <p className="page-subtitle">
          Describe what you want to build — AI will create a step-by-step plan
        </p>
      </div>

      <div className="space-y-5">

        {/* Main input card */}
        <div className="card p-6 space-y-5">

          {/* How it works */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: '1', label: 'Describe',  desc: 'Tell us what to build'      },
              { step: '2', label: 'Pick plan',  desc: 'Choose Basic, Medium or Advanced' },
              { step: '3', label: 'Build',      desc: 'Follow step by step code'  },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-3 rounded-xl bg-gray-50 border border-gray-200"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">
                  {item.step}
                </div>
                <p className="text-xs font-medium text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Description input */}
          <div>
            <label className="label">
              What do you want to build?
            </label>
            <textarea
              className="input resize-none h-36"
              placeholder="Describe your project in detail. For example: A custom ecommerce system with product catalog, shopping cart, Stripe payments, and admin dashboard..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              {description.trim().length} characters
              {description.trim().length < 10 && description.length > 0 && (
                <span className="text-red-400 ml-1">— minimum 10 characters</span>
              )}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Credits warning */}
          {(user?.creditsBalance ?? 0) < COST && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              You need at least {COST} credits to generate a plan.
            </div>
          )}

          <button
            className="btn-primary w-full py-3"
            onClick={handleGenerate}
            disabled={
              loading ||
              description.trim().length < 10 ||
              (user?.creditsBalance ?? 0) < COST
            }
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your project…</>
              : <><Wand2   className="w-4 h-4" /> Generate Plans ({COST} credits)</>
            }
          </button>
        </div>

        {/* Examples */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Example projects
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setDescription(ex)}
                disabled={loading}
                className="text-left text-sm text-gray-500 hover:text-indigo-600 px-3 py-2.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="card p-4 bg-indigo-50 border-indigo-200">
          <div className="flex items-start gap-3">
            <Code2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-indigo-900">
                Stack: MongoDB + Node.js + Next.js
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                All generated code uses TypeScript, follows best practices,
                and is ready to copy and run.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}