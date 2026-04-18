'use client'
import { useEffect, useRef, useState } from 'react'
import { jobsApi } from '@/lib/api'

export interface Job {
  _id:          string
  type:         'IMAGE' | 'VIDEO' | 'WEBSITE'
  status:       'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  prompt:       string
  creditsUsed:  number
  outputUrl?:   string
  outputData?:  { html?: string }
  errorMessage?: string
  createdAt:    string
  completedAt?: string
}

export function useJobPoller(jobId: string | null, intervalMs = 4000) {
  const [job,     setJob]     = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const poll = async (id: string) => {
    try {
      const res = await jobsApi.get(id)
      const j: Job = res.data.job
      setJob(j)
      if (j.status === 'COMPLETED' || j.status === 'FAILED') {
        if (timer.current) clearInterval(timer.current)
        setLoading(false)
      }
    } catch {
      setError('Failed to check job status')
      setLoading(false)
      if (timer.current) clearInterval(timer.current)
    }
  }

  useEffect(() => {
    if (!jobId) return
    setLoading(true)
    setError(null)
    poll(jobId)
    timer.current = setInterval(() => poll(jobId), intervalMs)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [jobId])

  return { job, loading, error }
}