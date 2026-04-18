'use client'
import { useState } from 'react'
import {
  Zap,
  Plus,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  Gift,
  Copy,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { creditsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { formatCredits, formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

const PACKAGES = [
  {
    credits: 100,
    price:   5,
    label:   'Starter',
    desc:    '~25 images',
    badge:   null,
  },
  {
    credits: 250,
    price:   10,
    label:   'Creator',
    desc:    '~62 images',
    badge:   'Popular',
  },
  {
    credits: 600,
    price:   20,
    label:   'Pro',
    desc:    '~150 images',
    badge:   'Best value',
  },
  {
    credits: 1500,
    price:   40,
    label:   'Studio',
    desc:    '~375 images',
    badge:   null,
  },
]

const TX_COLORS: Record<string, string> = {
  TOPUP:            'text-emerald-600',
  REFERRAL_RECEIVE: 'text-indigo-600',
  REFERRAL_GIVE:    'text-indigo-600',
  FREE_CREDITS:     'text-indigo-600',
  USAGE:            'text-gray-500',
}

const TX_LABELS: Record<string, string> = {
  TOPUP:            'Top up',
  REFERRAL_RECEIVE: 'Referral bonus',
  REFERRAL_GIVE:    'Referral reward',
  FREE_CREDITS:     'Free credits',
  USAGE:            'Used',
}

export default function CreditsPage() {
  const { user, updateUser } = useAuthStore()

  const [selected,  setSelected]  = useState(PACKAGES[1])
  const [loading,   setLoading]   = useState(false)
  const [devLoading, setDevLoading] = useState(false)
  const [error,     setError]     = useState('')
  const [copied,    setCopied]    = useState(false)
  const [page,      setPage]      = useState(1)

  const { data: historyData, refetch } = useQuery({
    queryKey: ['credits-history', page],
    queryFn:  () => creditsApi.history(page, 15),
    select:   (res) => res.data,
  })

  const handleTopUp = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await creditsApi.topup(selected.credits)
      window.location.href = res.data.checkoutUrl
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start checkout')
      setLoading(false)
    }
  }

  // Dev only — add credits without Stripe
  const handleDevAdd = async () => {
    setDevLoading(true)
    try {
      const res = await creditsApi.add(100)
      updateUser({ creditsBalance: res.data.balance })
      refetch()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add credits')
    } finally {
      setDevLoading(false)
    }
  }

  const handleCopyReferral = async () => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user?.referralCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user?.referralCode}`

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── Balance card ── */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0">
          <Zap className="w-7 h-7 text-white" fill="white" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Current balance</p>
          <p className="text-4xl font-bold text-gray-900 font-mono">
            {formatCredits(user?.creditsBalance ?? 0)}
          </p>
          <p className="text-gray-400 text-sm">credits available</p>
        </div>
      </div>

      {/* ── Credit costs reference ── */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Credit costs
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Image',   cost: 4,  color: 'bg-violet-50 border-violet-200 text-violet-700' },
            { label: 'Video',   cost: 40, color: 'bg-rose-50 border-rose-200 text-rose-700'       },
            { label: 'Website', cost: 20, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                'flex flex-col items-center p-3 rounded-xl border text-center',
                item.color
              )}
            >
              <span className="text-xl font-bold">{item.cost}</span>
              <span className="text-xs font-medium mt-0.5">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top up ── */}
      <div className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Buy credits
        </h3>

        {/* Package selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.credits}
              onClick={() => setSelected(pkg)}
              className={cn(
                'relative p-4 rounded-xl border text-left transition-all',
                selected.credits === pkg.credits
                  ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              )}
            >
              {pkg.badge && (
                <span className="absolute -top-2 left-3 text-[10px] font-semibold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                  {pkg.badge}
                </span>
              )}
              <div className="font-bold text-xl text-gray-900">
                {formatCredits(pkg.credits)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {pkg.desc}
              </div>
              <div className="font-semibold text-indigo-600 mt-2 text-sm">
                ${pkg.price}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleTopUp}
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to checkout…</>
            : <><Plus className="w-4 h-4" /> Buy {formatCredits(selected.credits)} credits for ${selected.price}</>
          }
        </button>

        <p className="text-xs text-gray-400 text-center">
          Secure checkout via Stripe · Credits added instantly · Never expire
        </p>

        {/* Dev mode button */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleDevAdd}
            disabled={devLoading}
            className="btn-secondary w-full text-xs py-2 border-dashed"
          >
            {devLoading
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Adding…</>
              : '🧪 Dev: Add 100 free credits'
            }
          </button>
        )}
      </div>

      {/* ── Referral ── */}
      <div className="card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              Refer a friend — earn credits
            </h3>
            <p className="text-gray-500 text-xs mt-1 mb-3">
              Share your link. You both get{' '}
              <strong className="text-indigo-600">20 free credits</strong>{' '}
              when they sign up.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={referralUrl}
                className="input text-xs py-2 flex-1 cursor-pointer bg-white"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopyReferral}
                className="btn-secondary text-xs py-2 px-3 shrink-0"
              >
                {copied
                  ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                  : <><Copy  className="w-3.5 h-3.5" /> Copy</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transaction history ── */}
      {historyData?.transactions?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Transaction history
          </h3>
          <div className="card divide-y divide-gray-100">
            {historyData.transactions.map((tx: any) => (
              <div
                key={tx._id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatRelative(tx.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'font-semibold text-sm',
                    TX_COLORS[tx.type] || 'text-gray-500'
                  )}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {TX_LABELS[tx.type] || tx.type}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {historyData.pagination?.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                Page {page} of {historyData.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === historyData.pagination.pages}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}