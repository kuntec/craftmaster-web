// 'use client'
// import { useState } from 'react'
// import {
//   Zap,
//   Plus,
//   Clock,
//   AlertCircle,
//   Loader2,
//   Check,
//   Gift,
//   Copy,
// } from 'lucide-react'
// import { useQuery } from '@tanstack/react-query'
// import { creditsApi } from '@/lib/api'
// import { useAuthStore } from '@/store/auth'
// import { formatCredits, formatRelative } from '@/lib/utils'
// import { cn } from '@/lib/utils'

// const PACKAGES = [
//   {
//     credits: 100,
//     price:   5,
//     label:   'Starter',
//     desc:    '~25 images',
//     badge:   null,
//   },
//   {
//     credits: 250,
//     price:   10,
//     label:   'Creator',
//     desc:    '~62 images',
//     badge:   'Popular',
//   },
//   {
//     credits: 600,
//     price:   20,
//     label:   'Pro',
//     desc:    '~150 images',
//     badge:   'Best value',
//   },
//   {
//     credits: 1500,
//     price:   40,
//     label:   'Studio',
//     desc:    '~375 images',
//     badge:   null,
//   },
// ]

// const TX_COLORS: Record<string, string> = {
//   TOPUP:            'text-emerald-600',
//   REFERRAL_RECEIVE: 'text-indigo-600',
//   REFERRAL_GIVE:    'text-indigo-600',
//   FREE_CREDITS:     'text-indigo-600',
//   USAGE:            'text-gray-500',
// }

// const TX_LABELS: Record<string, string> = {
//   TOPUP:            'Top up',
//   REFERRAL_RECEIVE: 'Referral bonus',
//   REFERRAL_GIVE:    'Referral reward',
//   FREE_CREDITS:     'Free credits',
//   USAGE:            'Used',
// }

// export default function CreditsPage() {
//   const { user, updateUser } = useAuthStore()

//   const [selected,  setSelected]  = useState(PACKAGES[1])
//   const [loading,   setLoading]   = useState(false)
//   const [devLoading, setDevLoading] = useState(false)
//   const [error,     setError]     = useState('')
//   const [copied,    setCopied]    = useState(false)
//   const [page,      setPage]      = useState(1)

//   const { data: historyData, refetch } = useQuery({
//     queryKey: ['credits-history', page],
//     queryFn:  () => creditsApi.history(page, 15),
//     select:   (res) => res.data,
//   })

//   const handleTopUp = async () => {
//     setLoading(true)
//     setError('')
//     try {
//       const res = await creditsApi.topup(selected.credits)
//       window.location.href = res.data.checkoutUrl
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed to start checkout')
//       setLoading(false)
//     }
//   }

//   // Dev only — add credits without Stripe
//   const handleDevAdd = async () => {
//     setDevLoading(true)
//     try {
//       const res = await creditsApi.add(selected.credits)
//       updateUser({ creditsBalance: res.data.balance })
//       refetch()
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed to add credits')
//     } finally {
//       setDevLoading(false)
//     }
//   }

//   const handleCopyReferral = async () => {
//     const url = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user?.referralCode}`
//     await navigator.clipboard.writeText(url)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user?.referralCode}`

//   return (
//     <div className="max-w-3xl space-y-6">

//       {/* ── Balance card ── */}
//       <div className="card p-6 flex items-center gap-5">
//         <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0">
//           <Zap className="w-7 h-7 text-white" fill="white" />
//         </div>
//         <div>
//           <p className="text-gray-500 text-sm">Current balance</p>
//           <p className="text-4xl font-bold text-gray-900 font-mono">
//             {formatCredits(user?.creditsBalance ?? 0)}
//           </p>
//           <p className="text-gray-400 text-sm">credits available</p>
//         </div>
//       </div>

//       {/* ── Credit costs reference ── */}
//       <div className="card p-5">
//         <h3 className="text-sm font-semibold text-gray-900 mb-3">
//           Credit costs
//         </h3>
//         <div className="grid grid-cols-3 gap-3">
//           {[
//             { label: 'Image',   cost: 4,  color: 'bg-violet-50 border-violet-200 text-violet-700' },
//             { label: 'Video',   cost: 40, color: 'bg-rose-50 border-rose-200 text-rose-700'       },
//             { label: 'Website', cost: 20, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
//           ].map((item) => (
//             <div
//               key={item.label}
//               className={cn(
//                 'flex flex-col items-center p-3 rounded-xl border text-center',
//                 item.color
//               )}
//             >
//               <span className="text-xl font-bold">{item.cost}</span>
//               <span className="text-xs font-medium mt-0.5">{item.label}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Top up ── */}
//       <div className="card p-6 space-y-5">
//         <h3 className="text-sm font-semibold text-gray-900">
//           Buy credits
//         </h3>

//         {/* Package selector */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           {PACKAGES.map((pkg) => (
//             <button
//               key={pkg.credits}
//               onClick={() => setSelected(pkg)}
//               className={cn(
//                 'relative p-4 rounded-xl border text-left transition-all',
//                 selected.credits === pkg.credits
//                   ? 'border-indigo-400 bg-indigo-50 shadow-sm'
//                   : 'border-gray-200 bg-white hover:border-indigo-300'
//               )}
//             >
//               {pkg.badge && (
//                 <span className="absolute -top-2 left-3 text-[10px] font-semibold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
//                   {pkg.badge}
//                 </span>
//               )}
//               <div className="font-bold text-xl text-gray-900">
//                 {formatCredits(pkg.credits)}
//               </div>
//               <div className="text-xs text-gray-400 mt-0.5">
//                 {pkg.desc}
//               </div>
//               <div className="font-semibold text-indigo-600 mt-2 text-sm">
//                 ${pkg.price}
//               </div>
//             </button>
//           ))}
//         </div>

//         {error && (
//           <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//             <AlertCircle className="w-4 h-4 shrink-0" />
//             {error}
//           </div>
//         )}

//         <button
//           onClick={handleTopUp}
//           disabled={loading}
//           className="btn-primary w-full py-3"
//         >
//           {loading
//             ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to checkout…</>
//             : <><Plus className="w-4 h-4" /> Buy {formatCredits(selected.credits)} credits for ${selected.price}</>
//           }
//         </button>

//         <p className="text-xs text-gray-400 text-center">
//           Secure checkout via Stripe · Credits added instantly · Never expire
//         </p>

//         {/* Dev mode button */}
//         {process.env.NODE_ENV === 'development' && (
//           <button
//             onClick={handleDevAdd}
//             disabled={devLoading}
//             className="btn-secondary w-full text-xs py-2 border-dashed"
//           >
//             {devLoading
//               ? <><Loader2 className="w-3 h-3 animate-spin" /> Adding…</>
//               : '🧪 Dev: Add 100 free credits'
//             }
//           </button>
//         )}
//       </div>

//       {/* ── Referral ── */}
//       <div className="card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
//         <div className="flex items-start gap-3">
//           <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
//             <Gift className="w-5 h-5 text-indigo-600" />
//           </div>
//           <div className="flex-1">
//             <h3 className="font-semibold text-gray-900 text-sm">
//               Refer a friend — earn credits
//             </h3>
//             <p className="text-gray-500 text-xs mt-1 mb-3">
//               Share your link. You both get{' '}
//               <strong className="text-indigo-600">20 free credits</strong>{' '}
//               when they sign up.
//             </p>
//             <div className="flex gap-2">
//               <input
//                 readOnly
//                 value={referralUrl}
//                 className="input text-xs py-2 flex-1 cursor-pointer bg-white"
//                 onClick={(e) => (e.target as HTMLInputElement).select()}
//               />
//               <button
//                 onClick={handleCopyReferral}
//                 className="btn-secondary text-xs py-2 px-3 shrink-0"
//               >
//                 {copied
//                   ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
//                   : <><Copy  className="w-3.5 h-3.5" /> Copy</>
//                 }
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Transaction history ── */}
//       {historyData?.transactions?.length > 0 && (
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900 mb-3">
//             Transaction history
//           </h3>
//           <div className="card divide-y divide-gray-100">
//             {historyData.transactions.map((tx: any) => (
//               <div
//                 key={tx._id}
//                 className="flex items-center justify-between px-5 py-3.5"
//               >
//                 <div>
//                   <p className="text-sm font-medium text-gray-900">
//                     {tx.description}
//                   </p>
//                   <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
//                     <Clock className="w-3 h-3" />
//                     {formatRelative(tx.createdAt)}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <span className={cn(
//                     'font-semibold text-sm',
//                     TX_COLORS[tx.type] || 'text-gray-500'
//                   )}>
//                     {tx.amount > 0 ? '+' : ''}{tx.amount}
//                   </span>
//                   <p className="text-[10px] text-gray-400 mt-0.5">
//                     {TX_LABELS[tx.type] || tx.type}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           {historyData.pagination?.pages > 1 && (
//             <div className="flex items-center justify-center gap-3 mt-4">
//               <button
//                 onClick={() => setPage((p) => p - 1)}
//                 disabled={page === 1}
//                 className="btn-secondary text-xs py-1.5 px-3"
//               >
//                 Previous
//               </button>
//               <span className="text-xs text-gray-500">
//                 Page {page} of {historyData.pagination.pages}
//               </span>
//               <button
//                 onClick={() => setPage((p) => p + 1)}
//                 disabled={page === historyData.pagination.pages}
//                 className="btn-secondary text-xs py-1.5 px-3">
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//     </div>
//   )
// }

'use client'
import { useState, useEffect, Suspense } from 'react'
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
import { useSearchParams } from 'next/navigation'

const PACKAGES = [
  { credits: 100,  price: 5,  label: 'Starter', desc: '~25 images',   badge: null         },
  { credits: 250,  price: 10, label: 'Creator', desc: '~62 images',   badge: 'Popular'     },
  { credits: 600,  price: 20, label: 'Pro',     desc: '~150 images',  badge: 'Best value'  },
  { credits: 1500, price: 40, label: 'Studio',  desc: '~375 images',  badge: null          },
]

// $1 = 20 credits
const CREDITS_PER_DOLLAR = 20
const MIN_CREDITS = 50
const MAX_CREDITS = 10000
const MIN_PRICE   = MIN_CREDITS / CREDITS_PER_DOLLAR   // $2.50
const MAX_PRICE   = MAX_CREDITS / CREDITS_PER_DOLLAR   // $500

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

function CreditsContent() {
  const { user, updateUser }  = useAuthStore()
  const searchParams          = useSearchParams()
  const success               = searchParams.get('success')
  const canceled              = searchParams.get('canceled')

  // Package selection
  const [selected,    setSelected]    = useState(PACKAGES[1])
  const [useCustom,   setUseCustom]   = useState(false)

  // Custom input state
  const [customCredits, setCustomCredits] = useState('')
  const [customPrice,   setCustomPrice]   = useState('')
  const [customError,   setCustomError]   = useState('')

  // Checkout state
  const [loading,    setLoading]    = useState(false)
  const [devLoading, setDevLoading] = useState(false)
  const [error,      setError]      = useState('')
  const [copied,     setCopied]     = useState(false)
  const [page,       setPage]       = useState(1)

  const { data: historyData, refetch } = useQuery({
    queryKey: ['credits-history', page],
    queryFn:  () => creditsApi.history(page, 15),
    select:   (res) => res.data,
  })

  // Sync credits balance after successful payment
  // useEffect(() => {
  //   if (success) {
  //     refetch()
  //     creditsApi.balance().then((res) => {
  //       updateUser({ creditsBalance: res.data.balance })
  //     })
  //   }
  // }, [success])

  useEffect(() => {
    if (success) {
      // Poll balance every 2 seconds for 10 seconds
      // to catch webhook delay
      let attempts = 0
      const interval = setInterval(async () => {
        attempts++
        try {
          const res = await creditsApi.balance()
          updateUser({ creditsBalance: res.data.balance })
          refetch()
        } catch {
          // silent
        }
        if (attempts >= 5) clearInterval(interval)
      }, 2000)
  
      return () => clearInterval(interval)
    }
  }, [success])

  // ── Custom input handlers ─────────────────────────────

  const handleCustomCreditsChange = (val: string) => {
    setCustomError('')
    setCustomCredits(val)
    const num = parseInt(val)
    if (!isNaN(num) && num > 0) {
      const price = (num / CREDITS_PER_DOLLAR).toFixed(2)
      setCustomPrice(price)
    } else {
      setCustomPrice('')
    }
  }

  const handleCustomPriceChange = (val: string) => {
    setCustomError('')
    setCustomPrice(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num > 0) {
      const credits = Math.floor(num * CREDITS_PER_DOLLAR)
      setCustomCredits(credits.toString())
    } else {
      setCustomCredits('')
    }
  }

  const validateCustom = (): boolean => {
    const credits = parseInt(customCredits)
    const price   = parseFloat(customPrice)

    if (!credits || isNaN(credits)) {
      setCustomError('Please enter a valid credit amount')
      return false
    }
    if (credits < MIN_CREDITS) {
      setCustomError(`Minimum is ${MIN_CREDITS} credits ($${MIN_PRICE})`)
      return false
    }
    if (credits > MAX_CREDITS) {
      setCustomError(`Maximum is ${MAX_CREDITS} credits ($${MAX_PRICE})`)
      return false
    }
    if (!price || isNaN(price)) {
      setCustomError('Invalid price calculation')
      return false
    }
    return true
  }

  // ── Get current credits/price to checkout ────────────

  const getCheckoutCredits = (): number => {
    if (useCustom) return parseInt(customCredits) || 0
    return selected.credits
  }

  // ── Checkout ──────────────────────────────────────────

  const handleTopUp = async () => {
    if (useCustom && !validateCustom()) return
    setLoading(true)
    setError('')
    try {
      const credits = getCheckoutCredits()
      const res     = await creditsApi.topup(credits)
      window.location.href = res.data.checkoutUrl
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start checkout')
      setLoading(false)
    }
  }

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

  // ── Current selection summary ─────────────────────────
  const currentCredits = useCustom
    ? (parseInt(customCredits) || 0)
    : selected.credits

  const currentPrice = useCustom
    ? (parseFloat(customPrice) || 0).toFixed(2)
    : selected.price

  const canCheckout = useCustom
    ? parseInt(customCredits) >= MIN_CREDITS
    : true

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── Success / Cancel banners ── */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Payment successful!</p>
            <p className="text-xs mt-0.5">Your credits have been added to your account.</p>
          </div>
        </div>
      )}

      {canceled && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Payment was canceled. No credits were added.</p>
        </div>
      )}

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
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Credit costs</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Image',   cost: 4,  color: 'bg-violet-50 border-violet-200 text-violet-700'   },
            { label: 'Video',   cost: 40, color: 'bg-rose-50 border-rose-200 text-rose-700'         },
            { label: 'Website', cost: 20, color: 'bg-emerald-50 border-emerald-200 text-emerald-700'},
            { label: 'Builder', cost: 15, color: 'bg-amber-50 border-amber-200 text-amber-700'      },
          ].map((item) => (
            <div key={item.label} className={cn('flex flex-col items-center p-3 rounded-xl border text-center', item.color)}>
              <span className="text-xl font-bold">{item.cost}</span>
              <span className="text-xs font-medium mt-0.5">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          20 credits = $1 · Credits never expire
        </p>
      </div>

      {/* ── Top up ── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Buy credits</h3>
          {/* Toggle custom/preset */}
          <button
            onClick={() => { setUseCustom(!useCustom); setCustomError('') }}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            {useCustom ? '← Choose a package' : 'Enter custom amount →'}
          </button>
        </div>

        {/* ── Preset packages ── */}
        {!useCustom && (
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
                <div className="text-xs text-gray-400 mt-0.5">{pkg.desc}</div>
                <div className="font-semibold text-indigo-600 mt-2 text-sm">
                  ${pkg.price}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Custom input ── */}
        {useCustom && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Credits input */}
              <div>
                <label className="label">Credits amount</label>
                <div className="relative">
                  <input
                    type="number"
                    className="input pr-16"
                    placeholder="e.g. 500"
                    value={customCredits}
                    min={MIN_CREDITS}
                    max={MAX_CREDITS}
                    onChange={(e) => handleCustomCreditsChange(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    credits
                  </span>
                </div>
              </div>

              {/* Price input */}
              <div>
                <label className="label">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    className="input pl-7"
                    placeholder="e.g. 25.00"
                    value={customPrice}
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step="0.01"
                    onChange={(e) => handleCustomPriceChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Rate info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-500">Exchange rate</span>
              <span className="text-xs font-medium text-gray-700">
                20 credits = $1.00
              </span>
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Quick select</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { credits: 100,  price: '5.00'  },
                  { credits: 300,  price: '15.00' },
                  { credits: 500,  price: '25.00' },
                  { credits: 1000, price: '50.00' },
                  { credits: 2000, price: '100.00'},
                ].map((q) => (
                  <button
                    key={q.credits}
                    onClick={() => {
                      setCustomCredits(q.credits.toString())
                      setCustomPrice(q.price)
                      setCustomError('')
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
                    {formatCredits(q.credits)} cr / ${q.price}
                  </button>
                ))}
              </div>
            </div>

            {/* Validation message */}
            {customCredits && parseInt(customCredits) >= MIN_CREDITS && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs">
                <Check className="w-3.5 h-3.5 shrink-0" />
                {formatCredits(parseInt(customCredits))} credits for ${parseFloat(customPrice || '0').toFixed(2)}
                {' '}· enough for ~{Math.floor(parseInt(customCredits) / 4)} images
              </div>
            )}

            {customError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {customError}
              </div>
            )}
          </div>
        )}

        {/* ── Global error ── */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* ── Checkout button ── */}
        <button
          onClick={handleTopUp}
          disabled={loading || !canCheckout}
          className="btn-primary w-full py-3"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to checkout…</>
            : <><Plus className="w-4 h-4" /> Buy {formatCredits(currentCredits)} credits for ${currentPrice}</>
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
              <div key={tx._id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatRelative(tx.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn('font-semibold text-sm', TX_COLORS[tx.type] || 'text-gray-500')}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {TX_LABELS[tx.type] || tx.type}
                  </p>
                </div>
              </div>
            ))}
          </div>

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

export default function CreditsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm p-6">Loading...</div>}>
      <CreditsContent />
    </Suspense>
  )
}