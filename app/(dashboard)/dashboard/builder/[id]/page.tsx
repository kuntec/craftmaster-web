'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Loader2,
    ChevronRight,
    Check,
    Copy,
    AlertCircle,
    Pause,
    Play,
    CheckCircle2,
    Code2,
    FileCode,
    Zap,           // ← add this
  } from 'lucide-react'
import { builderApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

interface ProjectFile {
  filename: string
  language: string
  code:     string
}

interface ProjectStep {
  stepNumber:       number
  title:            string
  explanation:      string
  files:            ProjectFile[]
  testInstructions: string
  creditsUsed:      number
  completedAt:      string
}

interface Project {
  _id:          string
  title:        string
  description:  string
  plan:         string
  status:       string
  totalSteps:   number
  currentStep:  number
  totalCredits: number
  usedCredits:  number
  plannedSteps: { stepNumber: number; title: string; description: string }[]
  steps:        ProjectStep[]
}

export default function ActiveBuilderPage() {
  const params     = useParams()
  const router     = useRouter()
  const updateUser = useAuthStore((s) => s.updateUser)
  const user       = useAuthStore((s) => s.user)

  const projectId = params.id as string

  const [project,     setProject]     = useState<Project | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [generating,  setGenerating]  = useState(false)
  const [error,       setError]       = useState('')
  const [copiedFile,  setCopiedFile]  = useState<string | null>(null)
  const [activeFile,  setActiveFile]  = useState<string | null>(null)

  // Load project
  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const res = await builderApi.getProject(projectId)
      setProject(res.data.project)
    } catch {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = async () => {
    if (!project) return
    const nextStepIndex = project.currentStep
    const nextPlannedStep = project.plannedSteps[nextStepIndex]

    if (!nextPlannedStep) return

    setGenerating(true)
    setError('')

    try {
      const res = await builderApi.nextStep(projectId, {
        stepTitle:       nextPlannedStep.title,
        stepDescription: nextPlannedStep.description,
      })

      // Update credits
      if (user) {
        updateUser({
          creditsBalance: user.creditsBalance - res.data.creditsUsed,
        })
      }

      // Reload project to get updated steps
      await loadProject()

      // Auto scroll to new step
      setTimeout(() => {
        const el = document.getElementById(`step-${res.data.step.stepNumber}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate step')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyCode = async (code: string, filename: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedFile(filename)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  const handlePauseResume = async () => {
    if (!project) return
    try {
      if (project.status === 'PAUSED') {
        await builderApi.resumeProject(projectId)
      } else {
        await builderApi.pauseProject(projectId)
      }
      await loadProject()
    } catch {
      setError('Failed to update project status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="card p-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-gray-900 font-medium">Project not found</p>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="btn-secondary mt-4 text-sm"
        >
          Back to projects
        </button>
      </div>
    )
  }

  const nextStep       = project.plannedSteps[project.currentStep]
  const isCompleted    = project.status === 'COMPLETED'
  const isPaused       = project.status === 'PAUSED'
  const progressPct    = Math.round((project.currentStep / project.totalSteps) * 100)
  const stepCreditCost = project.plan === 'BASIC' ? 8 : project.plan === 'MEDIUM' ? 15 : 20

  return (
    <div className="max-w-4xl space-y-5">

      {/* ── Project header ── */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-gray-900">{project.title}</h2>
              <span className={cn(
                'badge text-xs',
                isCompleted ? 'badge-success' :
                isPaused    ? 'badge-warning'  : 'badge-info'
              )}>
                {project.status.toLowerCase()}
              </span>
              <span className="badge badge-gray text-xs">
                {project.plan.toLowerCase()}
              </span>
            </div>
            <p className="text-xs text-gray-500">{project.description}</p>
          </div>

          {/* Pause / Resume */}
          {!isCompleted && (
            <button
              onClick={handlePauseResume}
              className="btn-secondary text-xs py-1.5"
            >
              {isPaused
                ? <><Play  className="w-3.5 h-3.5" /> Resume</>
                : <><Pause className="w-3.5 h-3.5" /> Pause</>
              }
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>
              Step {project.currentStep} of {project.totalSteps}
            </span>
            <span>{progressPct}% complete</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Credits used */}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
          <Zap className="w-3 h-3" />
          {project.usedCredits} credits used of ~{project.totalCredits} estimated
        </div>
      </div>

      {/* ── Steps list ── */}
      <div className="space-y-4">
        {project.steps.map((step) => (
          <div
            key={step.stepNumber}
            id={`step-${step.stepNumber}`}
            className="card p-5 space-y-4"
          >
            {/* Step header */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">
                    Step {step.stepNumber}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    {step.creditsUsed} credits
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-0.5">
                  {step.title}
                </h3>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                Why this step
              </p>
              <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
                {step.explanation}
              </p>
            </div>

            {/* Files */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Files
              </p>
              {step.files.map((file) => (
                <div
                  key={file.filename}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* File header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-gray-400" />
                      <code className="text-xs font-mono text-gray-700">
                        {file.filename}
                      </code>
                      <span className="badge badge-gray text-[10px]">
                        {file.language}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(file.code, file.filename)}
                      className="btn-ghost text-xs py-1 px-2"
                    >
                      {copiedFile === file.filename
                        ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</>
                        : <><Copy  className="w-3 h-3" /> Copy</>
                      }
                    </button>
                  </div>

                  {/* Code */}
                  <pre className="p-4 text-xs font-mono text-gray-700 overflow-x-auto bg-white leading-relaxed max-h-80 overflow-y-auto">
                    {file.code}
                  </pre>
                </div>
              ))}
            </div>

            {/* Test instructions */}
            {step.testInstructions && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wider">
                  Test this step
                </p>
                <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">
                  {step.testInstructions}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Next step button ── */}
      {!isCompleted && !isPaused && nextStep && (
        <div className="card p-5 border-indigo-200 bg-indigo-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-indigo-500 font-medium mb-0.5">
                Next up — Step {project.currentStep + 1}
              </p>
              <p className="font-semibold text-indigo-900">
                {nextStep.title}
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                {nextStep.description}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-indigo-400 mb-2">
                {stepCreditCost} credits
              </p>
              {error && (
                <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
              <button
                className="btn-primary"
                onClick={handleNextStep}
                disabled={
                  generating ||
                  (user?.creditsBalance ?? 0) < stepCreditCost
                }
              >
                {generating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <>Generate Step {project.currentStep + 1} <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Paused state ── */}
      {isPaused && (
        <div className="card p-5 border-amber-200 bg-amber-50 text-center">
          <Pause className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="font-semibold text-amber-900">Project is paused</p>
          <p className="text-sm text-amber-600 mt-1 mb-3">
            Resume when you're ready to continue building
          </p>
          <button onClick={handlePauseResume} className="btn-primary">
            <Play className="w-4 h-4" />
            Resume Project
          </button>
        </div>
      )}

      {/* ── Completed state ── */}
      {isCompleted && (
        <div className="card p-8 text-center border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-emerald-900">
            Project Complete!
          </h3>
          <p className="text-sm text-emerald-600 mt-1 mb-4">
            All {project.totalSteps} steps generated successfully.
            Used {project.usedCredits} credits.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push(`/dashboard/builder/${projectId}/history`)}
              className="btn-secondary"
            >
              <Code2 className="w-4 h-4" />
              View all steps
            </button>
            <button
              onClick={() => router.push('/dashboard/builder')}
              className="btn-primary"
            >
              Build another project
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// Need this for Zap icon
// function Zap({ className }: { className?: string }) {
//   return (
//     <svg className={className} viewBox="0 0 24 24" fill="currentColor">
//       <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
//     </svg>
//   )
// }