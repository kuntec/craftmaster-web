'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Loader2,
  ArrowLeft,
  Copy,
  Check,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { builderApi } from '@/lib/api'
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
}

interface Project {
  _id:         string
  title:       string
  plan:        string
  totalSteps:  number
  currentStep: number
  usedCredits: number
  steps:       ProjectStep[]
}

export default function StepHistoryPage() {
  const params  = useParams()
  const router  = useRouter()

  const projectId = params.id as string

  const [project,    setProject]    = useState<Project | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  const [expanded,   setExpanded]   = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await builderApi.getProject(projectId)
        setProject(res.data.project)
        // Expand last step by default
        const steps = res.data.project.steps
        if (steps.length > 0) {
          setExpanded(steps[steps.length - 1].stepNumber)
        }
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  const handleCopy = async (code: string, filename: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedFile(filename)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="max-w-4xl space-y-5">

      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/dashboard/builder/${projectId}`)}
          className="btn-ghost text-sm mb-3 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to builder
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {project.title} — All Steps
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {project.steps.length} of {project.totalSteps} steps completed ·{' '}
          {project.usedCredits} credits used
        </p>
      </div>

      {/* Steps */}
      {project.steps.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-sm">No steps generated yet</p>
          <button
            onClick={() => router.push(`/dashboard/builder/${projectId}`)}
            className="btn-primary mt-4 text-sm"
          >
            Start building
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {project.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="card overflow-hidden"
            >
              {/* Step header — clickable to expand */}
              <button
                onClick={() => setExpanded(
                  expanded === step.stepNumber ? null : step.stepNumber
                )}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold text-emerald-700">
                    {step.stepNumber}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {step.files.length} files · {step.creditsUsed} credits
                    </p>
                  </div>
                </div>
                {expanded === step.stepNumber
                  ? <ChevronUp   className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </button>

              {/* Expanded content */}
              {expanded === step.stepNumber && (
                <div className="border-t border-gray-100 p-4 space-y-4">

                  {/* Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                      Explanation
                    </p>
                    <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
                      {step.explanation}
                    </p>
                  </div>

                  {/* Files */}
                  <div className="space-y-3">
                    {step.files.map((file) => (
                      <div
                        key={file.filename}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
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
                            onClick={() => handleCopy(file.code, file.filename)}
                            className="btn-ghost text-xs py-1 px-2"
                          >
                            {copiedFile === file.filename
                              ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</>
                              : <><Copy  className="w-3 h-3" /> Copy</>
                            }
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-gray-700 overflow-x-auto bg-white leading-relaxed max-h-72 overflow-y-auto">
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}