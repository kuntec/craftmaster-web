'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  Zap,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { builderApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { cn, formatCredits } from '@/lib/utils'

interface PlanFeature {
  id:          string
  title:       string
  description: string
}

interface PlanStep {
  stepNumber:  number
  title:       string
  description: string
}

interface Plan {
  plan:             string
  title:            string
  description:      string
  features:         PlanFeature[]
  steps:            PlanStep[]
  totalSteps:       number
  estimatedCredits: number
}

const PLAN_STYLES: Record<string, {
  border: string
  bg:     string
  badge:  string
  label:  string
}> = {
  BASIC: {
    border: 'border-gray-200 hover:border-indigo-300',
    bg:     'bg-white',
    badge:  'bg-gray-100 text-gray-600',
    label:  'Basic',
  },
  MEDIUM: {
    border: 'border-indigo-400',
    bg:     'bg-indigo-50',
    badge:  'bg-indigo-500 text-white',
    label:  'Medium',
  },
  ADVANCED: {
    border: 'border-purple-300 hover:border-purple-400',
    bg:     'bg-white',
    badge:  'bg-purple-100 text-purple-700',
    label:  'Advanced',
  },
}

export default function PlanPage() {
  const router     = useRouter()
  const updateUser = useAuthStore((s) => s.updateUser)
  const user       = useAuthStore((s) => s.user)

  const [plans,       setPlans]       = useState<Plan[]>([])
  const [description, setDescription] = useState('')
  const [selected,    setSelected]    = useState<Plan | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    // Get plans from sessionStorage
    const storedPlans = sessionStorage.getItem('builder_plans')
    const storedDesc  = sessionStorage.getItem('builder_description')

    if (!storedPlans || !storedDesc) {
      router.push('/dashboard/builder')
      return
    }

    const parsed = JSON.parse(storedPlans) as Plan[]
    setPlans(parsed)
    setDescription(storedDesc)

    // Default select MEDIUM
    const medium = parsed.find((p) => p.plan === 'MEDIUM')
    if (medium) setSelected(medium)
  }, [])

  const handleStart = async () => {
    if (!selected) return
    setLoading(true)
    setError('')

    try {
      const res = await builderApi.startProject({
        title:        selected.title,
        description,
        plan:         selected.plan,
        features:     selected.features,
        steps:        selected.steps,
        totalCredits: selected.estimatedCredits,
      })

      const projectId = res.data.project._id

      // Clear sessionStorage
      sessionStorage.removeItem('builder_plans')
      sessionStorage.removeItem('builder_description')

      router.push(`/dashboard/builder/${projectId}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start project')
    } finally {
      setLoading(false)
    }
  }

  if (plans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="btn-ghost text-sm mb-3 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="page-header">
          <p className="page-subtitle">
            Choose a plan for: <strong>{description}</strong>
          </p>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const style    = PLAN_STYLES[plan.plan]
          const isSelected = selected?.plan === plan.plan
          const canAfford  = (user?.creditsBalance ?? 0) >= plan.estimatedCredits

          return (
            <div
              key={plan.plan}
              onClick={() => setSelected(plan)}
              className={cn(
                'card p-5 cursor-pointer transition-all space-y-4 relative',
                style.border,
                style.bg,
                isSelected && 'ring-2 ring-indigo-500 ring-offset-2',
                !canAfford && 'opacity-60'
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Plan badge + title */}
              <div>
                <span className={cn('badge mb-2', style.badge)}>
                  {style.label}
                </span>
                <h3 className="font-semibold text-gray-900 text-sm mt-1">
                  {plan.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {plan.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {plan.totalSteps}
                  </div>
                  <div className="text-[10px] text-gray-400">steps</div>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">
                    {formatCredits(plan.estimatedCredits)}
                  </div>
                  <div className="text-[10px] text-gray-400">credits</div>
                </div>
                {!canAfford && (
                  <span className="text-[10px] text-red-500 font-medium ml-auto">
                    Need more credits
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Features
                </p>
                {plan.features.map((f) => (
                  <div key={f.id} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600">{f.title}</span>
                  </div>
                ))}
              </div>

              {/* Steps preview */}
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Build steps
                </p>
                {plan.steps.slice(0, 4).map((s) => (
                  <div key={s.stepNumber} className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                      {s.stepNumber}
                    </div>
                    <span className="text-xs text-gray-500 truncate">{s.title}</span>
                  </div>
                ))}
                {plan.steps.length > 4 && (
                  <p className="text-[10px] text-gray-400 pl-5">
                    + {plan.steps.length - 4} more steps
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected plan summary + start */}
      {selected && (
        <div className="card p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {selected.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {selected.totalSteps} steps ·{' '}
              <span className="text-indigo-600 font-medium">
                ~{formatCredits(selected.estimatedCredits)} credits total
              </span>
              {' '}· ~{Math.round(selected.estimatedCredits * 0.01 * 100) / 100}$ estimated cost
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {error && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </span>
            )}
            <button
              className="btn-primary"
              onClick={handleStart}
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                : <>Start Building <ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      )}

    </div>
  )
}