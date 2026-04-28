// 'use client'
// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import {
//   ImageIcon, Video, Globe, Zap, Check,
//   ArrowRight, Wand2, Loader2, AlertCircle,
//   Download, Code2, ChevronRight, Star,
// } from 'lucide-react'
// import { api } from '@/lib/api'
// import { jobsApi } from '@/lib/api'
// import { cn } from '@/lib/utils'

// // ── Free image generator hook ─────────────────────────────
// function useFreeImageGen() {
//   const [prompt,     setPrompt]     = useState('')
//   const [replicateId,setReplicateId]= useState<string|null>(null)
//   const [outputUrl,  setOutputUrl]  = useState<string|null>(null)
//   const [loading,    setLoading]    = useState(false)
//   const [polling,    setPolling]    = useState(false)
//   const [error,      setError]      = useState('')
//   const [remaining,  setRemaining]  = useState<number|null>(null)

//   const generate = async () => {
//     if (!prompt.trim()) return
//     setLoading(true)
//     setError('')
//     setOutputUrl(null)
//     setReplicateId(null)

//     try {
//       const res = await api.post('/free/image/generate', { prompt: prompt.trim() })
//       setReplicateId(res.data.replicateId)
//       setRemaining(res.data.remaining)
//       setPolling(true)
//     } catch (err: any) {
//       setError(err.response?.data?.message || err.response?.data?.error || 'Generation failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Poll for result
//   useEffect(() => {
//     if (!replicateId || !polling) return
//     const interval = setInterval(async () => {
//       try {
//         const res = await api.get(`/jobs/replicate/${replicateId}`)
//         if (res.data.status === 'succeeded') {
//           setOutputUrl(res.data.output)
//           setPolling(false)
//           clearInterval(interval)
//         } else if (res.data.status === 'failed') {
//           setError('Generation failed. Please try again.')
//           setPolling(false)
//           clearInterval(interval)
//         }
//       } catch {
//         // keep polling
//       }
//     }, 3000)
//     return () => clearInterval(interval)
//   }, [replicateId, polling])

//   return { prompt, setPrompt, outputUrl, loading, polling, error, remaining, generate }
// }

// // ── Plan card component ───────────────────────────────────
// const PLAN_COLORS: Record<string, { border: string; badge: string }> = {
//   BASIC:    { border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-600'     },
//   MEDIUM:   { border: 'border-indigo-400', badge: 'bg-indigo-500 text-white'      },
//   ADVANCED: { border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700' },
// }

// // ── Main landing page ─────────────────────────────────────
// export default function LandingPage() {
//   // Free website state
//   const [webPrompt,  setWebPrompt]  = useState('')
//   const [webHtml,    setWebHtml]    = useState<string|null>(null)
//   const [webLoading, setWebLoading] = useState(false)
//   const [webError,   setWebError]   = useState('')

//   // Free builder state
//   const [builderDesc,    setBuilderDesc]    = useState('')
//   const [builderPlans,   setBuilderPlans]   = useState<any[]>([])
//   const [builderLoading, setBuilderLoading] = useState(false)
//   const [builderError,   setBuilderError]   = useState('')
//   const [selectedPlan,   setSelectedPlan]   = useState<any>(null)

//   // Image gen
//   const img = useFreeImageGen()

//   // Polling for free image using replicate directly
//   const [freeJobId, setFreeJobId] = useState<string|null>(null)
//   const [freeImgUrl, setFreeImgUrl] = useState<string|null>(null)
//   const [freePolling, setFreePolling] = useState(false)
//   const [freeLoading, setFreeLoading] = useState(false)
//   const [freeError, setFreeError] = useState('')
//   const [freePrompt, setFreePrompt] = useState('')
//   const [freeRemaining, setFreeRemaining] = useState<number|null>(null)

//   const generateFreeImage = async () => {
//     if (!freePrompt.trim()) return
//     setFreeLoading(true)
//     setFreeError('')
//     setFreeImgUrl(null)
//     setFreeJobId(null)

//     try {
//       const res = await api.post('/free/image/generate', {
//         prompt: freePrompt.trim()
//       })
//       setFreeJobId(res.data.replicateId)
//       setFreeRemaining(res.data.remaining)
//       setFreePolling(true)
//     } catch (err: any) {
//       setFreeError(
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         'Generation failed'
//       )
//     } finally {
//       setFreeLoading(false)
//     }
//   }

//   // Poll free image job
//   useEffect(() => {
//     if (!freeJobId || !freePolling) return
//     const interval = setInterval(async () => {
//       try {
// //        const res = await api.get(`/jobs/poll/${freeJobId}`)
//         const res = await api.get(`/free/jobs/poll/${freeJobId}`)
//         if (res.data.status === 'succeeded') {
//           const out = res.data.output
//           setFreeImgUrl(Array.isArray(out) ? out[0] : out)
//           setFreePolling(false)
//           clearInterval(interval)
//         } else if (res.data.status === 'failed') {
//           setFreeError('Generation failed. Please try again.')
//           setFreePolling(false)
//           clearInterval(interval)
//         }
//       } catch {
//         // keep polling
//       }
//     }, 3000)
//     return () => clearInterval(interval)
//   }, [freeJobId, freePolling])

//   // Free website generation
//   const generateFreeWebsite = async () => {
//     if (!webPrompt.trim()) return
//     setWebLoading(true)
//     setWebError('')
//     setWebHtml(null)
//     try {
//       const res = await api.post('/free/website/generate', {
//         prompt: webPrompt.trim()
//       })
//       setWebHtml(res.data.html)
//     } catch (err: any) {
//       setWebError(
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         'Generation failed'
//       )
//     } finally {
//       setWebLoading(false)
//     }
//   }

//   // Free builder plan generation
//   const generateBuilderPlans = async () => {
//     if (!builderDesc.trim()) return
//     setBuilderLoading(true)
//     setBuilderError('')
//     setBuilderPlans([])
//     setSelectedPlan(null)
//     try {
//       const res = await api.post('/free/builder/plan', {
//         description: builderDesc.trim()
//       })
//       setBuilderPlans(res.data.plans)
//       setSelectedPlan(res.data.plans[1] || res.data.plans[0])
//     } catch (err: any) {
//       setBuilderError(
//         err.response?.data?.error ||
//         'Failed to generate plans'
//       )
//     } finally {
//       setBuilderLoading(false)
//     }
//   }

//   const isGeneratingImage = freeLoading || freePolling

//   return (
//     <div className="min-h-screen bg-white">

//       {/* ── Navbar ── */}
//       <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
//         <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
//               <span className="text-white font-bold text-sm">42</span>
//             </div>
//             <span className="font-bold text-gray-900">Studio42</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <Link href="/login"    className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
//               Sign in
//             </Link>
//             <Link href="/register" className="btn-primary text-sm py-2">
//               Start free
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* ── Hero ── */}
//       <section className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
//         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium mb-6">
//           <Zap className="w-4 h-4" fill="currentColor" />
//           No subscription · Pay as you go · Credits never expire
//         </div>
//         <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-5">
//           The answer to all your{' '}
//           <span className="text-indigo-500">AI tool needs.</span>
//         </h1>
//         <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
//           Generate images, videos and websites. Build complete projects with AI.
//           Pay only when you use it. The answer was always 42.
//         </p>
//         <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
//           <Link href="/register" className="btn-primary text-base px-8 py-3 shadow-lg">
//             Get 30 free credits <ArrowRight className="w-5 h-5" />
//           </Link>
//           <a href="#try-free" className="btn-secondary text-base px-8 py-3">
//             Try without signup ↓
//           </a>
//         </div>
//         <p className="text-sm text-gray-400">No credit card required</p>
//       </section>

//       {/* ── Free Image Generator ── */}
//       <section id="try-free" className="bg-gray-50 py-16 px-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-8">
//             <span className="badge bg-emerald-100 text-emerald-700 mb-3">
//               ✨ Free — no signup needed
//             </span>
//             <h2 className="text-3xl font-bold text-gray-900">
//               Try the image generator
//             </h2>
//             <p className="text-gray-500 mt-2">
//               3 free images per day · No account required
//             </p>
//           </div>

//           <div className="card p-6 max-w-2xl mx-auto">
//             <div className="flex gap-3 mb-4">
//               <input
//                 type="text"
//                 className="input flex-1"
//                 placeholder="A majestic lion at golden hour, cinematic..."
//                 value={freePrompt}
//                 onChange={(e) => setFreePrompt(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && generateFreeImage()}
//                 disabled={isGeneratingImage}
//               />
//               <button
//                 className="btn-primary shrink-0"
//                 onClick={generateFreeImage}
//                 disabled={!freePrompt.trim() || isGeneratingImage}
//               >
//                 {isGeneratingImage
//                   ? <Loader2 className="w-4 h-4 animate-spin" />
//                   : <Wand2   className="w-4 h-4" />
//                 }
//                 {!isGeneratingImage && <span className="hidden sm:inline ml-1">Generate</span>}
//               </button>
//             </div>

//             {/* Quick prompts */}
//             <div className="flex flex-wrap gap-2 mb-4">
//               {[
//                 'Futuristic city at night',
//                 'Cute cat in a garden',
//                 'Abstract art, blue tones',
//                 'Mountain landscape at sunrise',
//               ].map((p) => (
//                 <button
//                   key={p}
//                   onClick={() => setFreePrompt(p)}
//                   className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
//                 >
//                   {p}
//                 </button>
//               ))}
//             </div>

//             {/* Output */}
//             <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square max-w-sm mx-auto">
//               {!freeImgUrl && !isGeneratingImage && (
//                 <div className="w-full h-full flex flex-col items-center justify-center gap-2">
//                   <ImageIcon className="w-10 h-10 text-gray-300" />
//                   <p className="text-gray-400 text-sm">Your image appears here</p>
//                 </div>
//               )}

//               {isGeneratingImage && (
//                 <div className="w-full h-full flex flex-col items-center justify-center gap-3">
//                   <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
//                   <p className="text-gray-500 text-sm">Creating your image…</p>
//                 </div>
//               )}

//               {freeImgUrl && !isGeneratingImage && (
//                 <>
//                   <img
//                     src={freeImgUrl}
//                     alt={freePrompt}
//                     className="w-full h-full object-cover"
//                   />
//                   {/* Watermark */}
//                   <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
//                     Studio42.ai
//                   </div>
//                 </>
//               )}
//             </div>

//             {freeError && (
//               <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//                 <AlertCircle className="w-4 h-4 shrink-0" />
//                 {freeError}
//               </div>
//             )}

//             {freeImgUrl && (
//               <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
//                 <p className="text-sm font-medium text-indigo-900 mb-2">
//                   Want to download full resolution?
//                 </p>
//                 <Link href="/register" className="btn-primary text-sm py-2 inline-flex">
//                   Sign up free — get 30 credits <ArrowRight className="w-4 h-4" />
//                 </Link>
//               </div>
//             )}

//             {freeRemaining !== null && freeRemaining > 0 && (
//               <p className="text-center text-xs text-gray-400 mt-3">
//                 {freeRemaining} free image{freeRemaining !== 1 ? 's' : ''} remaining today
//               </p>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ── Free Website Builder ── */}
//       <section className="py-16 px-4">
//         <div className="max-w-5xl mx-auto">
//           <div className="text-center mb-8">
//             <span className="badge bg-emerald-100 text-emerald-700 mb-3">
//               ✨ Free — no signup needed
//             </span>
//             <h2 className="text-3xl font-bold text-gray-900">
//               Try the website builder
//             </h2>
//             <p className="text-gray-500 mt-2">
//               1 free website per day · Live preview · No account required
//             </p>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
//             {/* Input */}
//             <div className="card p-5 space-y-4">
//               <div>
//                 <label className="label">Describe your website</label>
//                 <textarea
//                   className="input resize-none h-28"
//                   placeholder="A landing page for a mobile fitness app called FitTrack for busy professionals..."
//                   value={webPrompt}
//                   onChange={(e) => setWebPrompt(e.target.value)}
//                   disabled={webLoading}
//                 />
//               </div>

//               {/* Examples */}
//               <div className="flex flex-col gap-1.5">
//                 {[
//                   'Portfolio for a freelance graphic designer',
//                   'Restaurant website for modern Italian dining',
//                   'SaaS landing page for a project management tool',
//                 ].map((ex) => (
//                   <button
//                     key={ex}
//                     onClick={() => setWebPrompt(ex)}
//                     className="text-left text-xs text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all"
//                   >
//                     {ex}
//                   </button>
//                 ))}
//               </div>

//               {webError && (
//                 <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
//                   <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
//                   {webError}
//                 </div>
//               )}

//               <button
//                 className="btn-primary w-full py-2.5"
//                 onClick={generateFreeWebsite}
//                 disabled={!webPrompt.trim() || webLoading}
//               >
//                 {webLoading
//                   ? <><Loader2 className="w-4 h-4 animate-spin" /> Building…</>
//                   : <><Wand2   className="w-4 h-4" /> Generate website</>
//                 }
//               </button>

//               {webHtml && (
//                 <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
//                   <p className="text-xs font-medium text-indigo-900 mb-2">
//                     Sign up to download without watermark
//                   </p>
//                   <Link href="/register" className="btn-primary text-xs py-2 inline-flex">
//                     Get 30 free credits <ArrowRight className="w-3.5 h-3.5" />
//                   </Link>
//                 </div>
//               )}
//             </div>

//             {/* Preview */}
//             <div className="card overflow-hidden" style={{ minHeight: '400px' }}>
//               {!webHtml && !webLoading && (
//                 <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 min-h-[400px]">
//                   <Globe className="w-12 h-12 text-gray-200" />
//                   <p className="text-gray-400 text-sm text-center">
//                     Your website preview appears here
//                   </p>
//                 </div>
//               )}

//               {webLoading && (
//                 <div className="w-full h-full flex flex-col items-center justify-center gap-3 min-h-[400px]">
//                   <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
//                   <p className="text-gray-500 text-sm">Building your website…</p>
//                   <p className="text-gray-400 text-xs">Usually 15-30 seconds</p>
//                 </div>
//               )}

//               {webHtml && (
//                 <iframe
//                   srcDoc={webHtml}
//                   className="w-full border-0"
//                   style={{ height: '400px' }}
//                   sandbox="allow-scripts"
//                   title="Free website preview"
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Free AI Builder Plans ── */}
//       <section className="bg-gray-50 py-16 px-4">
//         <div className="max-w-5xl mx-auto">
//           <div className="text-center mb-8">
//             <span className="badge bg-emerald-100 text-emerald-700 mb-3">
//               ✨ Always free — no signup needed
//             </span>
//             <h2 className="text-3xl font-bold text-gray-900">
//               Try the AI Project Builder
//             </h2>
//             <p className="text-gray-500 mt-2">
//               Describe any app — get a full step-by-step build plan instantly
//             </p>
//           </div>

//           <div className="max-w-2xl mx-auto mb-8">
//             <div className="card p-5 space-y-4">
//               <div>
//                 <label className="label">What do you want to build?</label>
//                 <textarea
//                   className="input resize-none h-24"
//                   placeholder="I want to build a food delivery app with restaurants, orders and payments..."
//                   value={builderDesc}
//                   onChange={(e) => setBuilderDesc(e.target.value)}
//                   disabled={builderLoading}
//                 />
//               </div>

//               {/* Quick examples */}
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   'Ecommerce store with cart and payments',
//                   'Social media app for developers',
//                   'Booking system for appointments',
//                   'Blog platform with comments',
//                 ].map((ex) => (
//                   <button
//                     key={ex}
//                     onClick={() => setBuilderDesc(ex)}
//                     className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
//                   >
//                     {ex}
//                   </button>
//                 ))}
//               </div>

//               {builderError && (
//                 <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//                   <AlertCircle className="w-4 h-4 shrink-0" />
//                   {builderError}
//                 </div>
//               )}

//               <button
//                 className="btn-primary w-full py-2.5"
//                 onClick={generateBuilderPlans}
//                 disabled={!builderDesc.trim() || builderLoading}
//               >
//                 {builderLoading
//                   ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your project…</>
//                   : <><Code2   className="w-4 h-4" /> Generate build plan (free)</>
//                 }
//               </button>
//             </div>
//           </div>

//           {/* Plans display */}
//           {builderPlans.length > 0 && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {builderPlans.map((plan: any) => {
//                   const style     = PLAN_COLORS[plan.plan] || PLAN_COLORS.BASIC
//                   const isSelected = selectedPlan?.plan === plan.plan

//                   return (
//                     <div
//                       key={plan.plan}
//                       onClick={() => setSelectedPlan(plan)}
//                       className={cn(
//                         'card p-5 cursor-pointer transition-all space-y-3',
//                         style.border,
//                         isSelected && 'ring-2 ring-indigo-500 ring-offset-2'
//                       )}
//                     >
//                       <div className="flex items-center justify-between">
//                         <span className={cn('badge', style.badge)}>
//                           {plan.plan}
//                         </span>
//                         <span className="text-sm font-bold text-indigo-600">
//                           ~{plan.estimatedCredits} credits
//                         </span>
//                       </div>

//                       <h3 className="font-semibold text-gray-900 text-sm">
//                         {plan.title}
//                       </h3>
//                       <p className="text-xs text-gray-500">
//                         {plan.description}
//                       </p>

//                       <div className="text-xs text-gray-400">
//                         {plan.totalSteps} steps
//                       </div>

//                       {/* Features */}
//                       <div className="space-y-1">
//                         {plan.features.slice(0, 4).map((f: any) => (
//                           <div key={f.id} className="flex items-center gap-1.5">
//                             <Check className="w-3 h-3 text-emerald-500 shrink-0" />
//                             <span className="text-xs text-gray-600">{f.title}</span>
//                           </div>
//                         ))}
//                         {plan.features.length > 4 && (
//                           <p className="text-xs text-gray-400 pl-4">
//                             +{plan.features.length - 4} more features
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>

//               {/* CTA to sign up */}
//               {selectedPlan && (
//                 <div className="card p-6 bg-indigo-50 border-indigo-200 text-center max-w-lg mx-auto">
//                   <h3 className="font-semibold text-indigo-900 mb-1">
//                     Ready to build {selectedPlan.title}?
//                   </h3>
//                   <p className="text-sm text-indigo-600 mb-4">
//                     You need ~{selectedPlan.estimatedCredits} credits.
//                     Sign up free and get 30 credits to start.
//                   </p>
//                   <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                     <Link
//                       href={`/register?plan=${selectedPlan.plan}&desc=${encodeURIComponent(builderDesc)}`}
//                       className="btn-primary justify-center"
//                     >
//                       Sign up free — start building
//                       <ChevronRight className="w-4 h-4" />
//                     </Link>
//                     <Link href="/login" className="btn-secondary justify-center text-sm">
//                       Already have an account
//                     </Link>
//                   </div>
//                   <p className="text-xs text-indigo-400 mt-3">
//                     Your plan is saved — start building immediately after signup
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ── Tools section ── */}
//       <section className="py-16 px-4">
//         <div className="max-w-5xl mx-auto">
//           <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
//             Everything you need to create
//           </h2>
//           <p className="text-gray-500 text-center mb-10">
//             Four powerful AI tools. One credit wallet. Pay only when you use them.
//           </p>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {[
//               { icon: ImageIcon, label: 'Image Generator', desc: 'FLUX 1.1 Pro — best in class quality',  cost: '4 credits',  color: 'bg-violet-500'  },
//               { icon: Video,     label: 'Video Generator', desc: 'Cinematic AI video clips up to 10s',     cost: '40 credits', color: 'bg-rose-500'    },
//               { icon: Globe,     label: 'Website Builder', desc: 'Full production website in 30 seconds',  cost: '20 credits', color: 'bg-emerald-500' },
//               { icon: Code2,     label: 'AI Builder',      desc: 'Complete codebase step by step',         cost: '8+ credits', color: 'bg-amber-500'   },
//             ].map((t) => {
//               const Icon = t.icon
//               return (
//                 <div key={t.label} className="card p-5 space-y-3">
//                   <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center`}>
//                     <Icon className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 text-sm">{t.label}</h3>
//                     <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
//                   </div>
//                   <span className="text-xs text-gray-400 font-medium">⚡ {t.cost}</span>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ── Pricing ── */}
//       <section className="bg-gray-50 py-16 px-4">
//         <div className="max-w-3xl mx-auto text-center">
//           <h2 className="text-3xl font-bold text-gray-900 mb-3">
//             Simple, honest pricing
//           </h2>
//           <p className="text-gray-500 mb-10">
//             Buy once. Use whenever. Credits never expire.
//           </p>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
//             {[
//               { credits: 100,  price: 5,  popular: false },
//               { credits: 250,  price: 10, popular: true  },
//               { credits: 600,  price: 20, popular: false },
//               { credits: 1500, price: 40, popular: false },
//             ].map((pkg) => (
//               <div key={pkg.credits} className={cn(
//                 'card p-5 text-center relative',
//                 pkg.popular && 'border-indigo-400 bg-indigo-50'
//               )}>
//                 {pkg.popular && (
//                   <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
//                     Popular
//                   </span>
//                 )}
//                 <div className="text-2xl font-bold text-gray-900">{pkg.credits}</div>
//                 <div className="text-gray-400 text-xs mb-2">credits</div>
//                 <div className="text-indigo-600 font-bold text-lg">${pkg.price}</div>
//               </div>
//             ))}
//           </div>
//           <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-8">
//             {[
//               'Credits never expire',
//               'No subscription',
//               'Stripe secured',
//               'Instant delivery',
//             ].map((f) => (
//               <span key={f} className="flex items-center gap-1.5">
//                 <Check className="w-4 h-4 text-emerald-500" />{f}
//               </span>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ── */}
//       <section className="bg-indigo-500 py-20 px-4 text-center">
//         <h2 className="text-3xl font-bold text-white mb-3">
//           Stop paying for tools you barely use.
//         </h2>
//         <p className="text-indigo-200 text-lg mb-8">
//           Start with 30 free credits. No card needed. The answer is 42.
//         </p>
//         <Link
//           href="/register"
//           className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-all text-base"
//         >
//           Get started free <ArrowRight className="w-5 h-5" />
//         </Link>
//       </section>

//       {/* ── Footer ── */}
//       <footer className="border-t border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
//         © {new Date().getFullYear()} Studio42.ai · AI tools without the subscription trap.
//         <div className="flex items-center justify-center gap-4 mt-3">
//           <Link href="/login"    className="hover:text-gray-600">Sign in</Link>
//           <Link href="/register" className="hover:text-gray-600">Register</Link>
//         </div>
//       </footer>

//     </div>
//   )
// }

// 'use client'
// import { useState, useEffect, useRef } from 'react'
// import Link from 'next/link'
// import {
//   ImageIcon, Video, Globe, Code2, Zap,
//   Check, ArrowRight, Loader2, AlertCircle,
//   X, ChevronDown, Star, TrendingDown,
//   DollarSign, Sparkles, Menu,
// } from 'lucide-react'
// import { api } from '@/lib/api'
// import { cn } from '@/lib/utils'

// // ── Types ─────────────────────────────────────────────────
// type Tool = 'image' | 'website' | 'video' | 'builder'

// interface Plan {
//   plan:             string
//   title:            string
//   description:      string
//   features:         { id: string; title: string; description: string }[]
//   steps:            { stepNumber: number; title: string; description: string }[]
//   totalSteps:       number
//   estimatedCredits: number
// }

// // ── Tool config ───────────────────────────────────────────
// const TOOLS: {
//   id:          Tool
//   label:       string
//   icon:        any
//   placeholder: string
//   color:       string
//   textColor:   string
//   borderColor: string
//   cost:        string
// }[] = [
//   {
//     id:          'image',
//     label:       'Image',
//     icon:        ImageIcon,
//     placeholder: 'A majestic lion at golden hour, cinematic lighting...',
//     color:       'bg-violet-500',
//     textColor:   'text-violet-600',
//     borderColor: 'border-violet-400',
//     cost:        '4 credits',
//   },
//   {
//     id:          'website',
//     label:       'Website',
//     icon:        Globe,
//     placeholder: 'A landing page for a fitness app called FitTrack for busy professionals...',
//     color:       'bg-emerald-500',
//     textColor:   'text-emerald-600',
//     borderColor: 'border-emerald-400',
//     cost:        '20 credits',
//   },
//   {
//     id:          'video',
//     label:       'Video',
//     icon:        Video,
//     placeholder: 'A slow cinematic pan over misty mountains at golden hour...',
//     color:       'bg-rose-500',
//     textColor:   'text-rose-600',
//     borderColor: 'border-rose-400',
//     cost:        '40 credits',
//   },
//   {
//     id:          'builder',
//     label:       'AI Builder',
//     icon:        Code2,
//     placeholder: 'I want to build a food delivery app with restaurants, cart and payments...',
//     color:       'bg-amber-500',
//     textColor:   'text-amber-600',
//     borderColor: 'border-amber-400',
//     cost:        'Free preview',
//   },
// ]

// // ── Comparison data ───────────────────────────────────────
// const COMPETITORS = [
//   {
//     name:    'Midjourney',
//     logo:    '🎨',
//     price:   '$10/mo',
//     tools:   1,
//     locked:  true,
//     note:    'Images only',
//   },
//   {
//     name:    'Runway',
//     logo:    '🎬',
//     price:   '$15/mo',
//     tools:   1,
//     locked:  true,
//     note:    'Video only',
//   },
//   {
//     name:    'Lovable',
//     logo:    '💜',
//     price:   '$25/mo',
//     tools:   1,
//     locked:  true,
//     note:    'Apps only',
//   },
//   {
//     name:    'All three',
//     logo:    '😰',
//     price:   '$50/mo',
//     tools:   3,
//     locked:  true,
//     note:    'Still missing website + AI Builder',
//   },
//   {
//     name:    'Studio42',
//     logo:    '⚡',
//     price:   'Pay as you go',
//     tools:   4,
//     locked:  false,
//     note:    'All tools + credits never expire',
//     highlight: true,
//   },
// ]

// const USAGE_SCENARIOS = [
//   {
//     scenario:  'Freelancer needing 10 images for a client',
//     others:    '$10/mo (forced subscription)',
//     studio42:  '$0.50 (40 credits)',
//     saving:    '95% cheaper',
//   },
//   {
//     scenario:  'Building a landing page for a startup',
//     others:    '$25/mo Lovable subscription',
//     studio42:  '$1.00 (20 credits)',
//     saving:    '97% cheaper',
//   },
//   {
//     scenario:  'Creating 5 videos for a campaign',
//     others:    '$15/mo Runway subscription',
//     studio42:  '$10.00 (200 credits)',
//     saving:    '33% cheaper',
//   },
//   {
//     scenario:  'Building a full ecommerce app',
//     others:    '$50/mo (multiple tools)',
//     studio42:  '$12.25 (245 credits)',
//     saving:    '75% cheaper',
//   },
// ]

// // ── Main component ────────────────────────────────────────
// export default function LandingPage() {
//   const [activeTool,   setActiveTool]   = useState<Tool>('image')
//   const [prompt,       setPrompt]       = useState('')
//   const [loading,      setLoading]      = useState(false)
//   const [error,        setError]        = useState('')
//   const [mobileMenu,   setMobileMenu]   = useState(false)

//   // Results
//   const [imageJobId,   setImageJobId]   = useState<string | null>(null)
//   const [imageUrl,     setImageUrl]     = useState<string | null>(null)
//   const [imagePolling, setImagePolling] = useState(false)
//   const [websiteHtml,  setWebsiteHtml]  = useState<string | null>(null)
//   const [builderPlans, setBuilderPlans] = useState<Plan[]>([])
//   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
//   const resultRef = useRef<HTMLDivElement>(null)

//   const currentTool = TOOLS.find((t) => t.id === activeTool)!

//   // Reset results when tool changes
//   useEffect(() => {
//     setImageUrl(null)
//     setImageJobId(null)
//     setWebsiteHtml(null)
//     setBuilderPlans([])
//     setSelectedPlan(null)
//     setError('')
//     setPrompt('')
//   }, [activeTool])

//   // Poll image job
//   useEffect(() => {
//     if (!imageJobId || !imagePolling) return
//     const interval = setInterval(async () => {
//       try {
//         const res = await api.get(`/free/jobs/poll/${imageJobId}`)
//         if (res.data.status === 'succeeded') {
//           const out = res.data.output
//           setImageUrl(Array.isArray(out) ? out[0] : out)
//           setImagePolling(false)
//           setLoading(false)
//           clearInterval(interval)
//           setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
//         } else if (res.data.status === 'failed') {
//           setError('Generation failed. Please try again.')
//           setImagePolling(false)
//           setLoading(false)
//           clearInterval(interval)
//         }
//       } catch { /* keep polling */ }
//     }, 3000)
//     return () => clearInterval(interval)
//   }, [imageJobId, imagePolling])

//   const handleGenerate = async () => {
//     if (!prompt.trim()) return
//     setLoading(true)
//     setError('')
//     setImageUrl(null)
//     setWebsiteHtml(null)
//     setBuilderPlans([])
//     setSelectedPlan(null)

//     try {
//       if (activeTool === 'image') {
//         const res = await api.post('/free/image/generate', { prompt: prompt.trim() })
//         setImageJobId(res.data.replicateId)
//         setImagePolling(true)

//       } else if (activeTool === 'website') {
//         const res = await api.post('/free/website/generate', { prompt: prompt.trim() })
//         setWebsiteHtml(res.data.html)
//         setLoading(false)
//         setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

//       } else if (activeTool === 'video') {
//         // Video requires login — redirect
//         window.location.href = `/register?redirect=video&prompt=${encodeURIComponent(prompt)}`

//       } else if (activeTool === 'builder') {
//         const res = await api.post('/free/builder/plan', { description: prompt.trim() })
//         setBuilderPlans(res.data.plans)
//         setSelectedPlan(res.data.plans[1] || res.data.plans[0])
//         setLoading(false)
//         setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
//       }
//     } catch (err: any) {
//       setError(
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         'Generation failed. Please try again.'
//       )
//       setLoading(false)
//     }
//   }

//   const hasResult = imageUrl || websiteHtml || builderPlans.length > 0
//   const isGenerating = loading || imagePolling

//   return (
//     <div className="min-h-screen bg-[#0a0a0f] text-white">

//       {/* ── Navbar ── */}
//       <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
//         <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-2.5">
//             <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
//               <span className="text-white font-black text-sm">42</span>
//             </div>
//             <span className="font-bold text-white text-lg tracking-tight">Studio42</span>
//           </div>

//           {/* Desktop nav */}
//           <div className="hidden md:flex items-center gap-6">
//             <a href="#compare"  className="text-sm text-white/50 hover:text-white transition-colors">Pricing</a>
//             <a href="#tools"    className="text-sm text-white/50 hover:text-white transition-colors">Tools</a>
//             <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
//             <Link href="/register" className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
//               Start free
//             </Link>
//           </div>

//           {/* Mobile menu button */}
//           <button
//             onClick={() => setMobileMenu(!mobileMenu)}
//             className="md:hidden p-2 text-white/50 hover:text-white"
//           >
//             {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//           </button>
//         </div>

//         {/* Mobile menu */}
//         {mobileMenu && (
//           <div className="md:hidden border-t border-white/5 px-4 py-4 flex flex-col gap-3 bg-[#0a0a0f]">
//             <a href="#compare"     className="text-sm text-white/60 py-2">Pricing</a>
//             <a href="#tools"       className="text-sm text-white/60 py-2">Tools</a>
//             <Link href="/login"    className="text-sm text-white/60 py-2">Sign in</Link>
//             <Link href="/register" className="btn-primary text-sm py-2.5 justify-center">Start free</Link>
//           </div>
//         )}
//       </nav>

//       {/* ── Hero ── */}
//       <section className="relative overflow-hidden">
//         {/* Background glow */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
//           <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-3xl" />
//           <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-rose-500/8 rounded-full blur-3xl" />
//         </div>

//         <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
//           {/* Badge */}
//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
//             <Zap className="w-4 h-4" fill="currentColor" />
//             No subscription · Pay as you go · Credits never expire
//           </div>

//           {/* Headline */}
//           <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-6">
//             The answer to all
//             <br />
//             <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
//               your AI needs.
//             </span>
//           </h1>

//           <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
//             Images, videos, websites and complete codebases — one platform,
//             one credit wallet. Pay only when you create.
//           </p>

//           {/* ── Central chat box ── */}
//           <div className="max-w-2xl mx-auto">
//             <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">

//               {/* Tool selector tabs */}
//               <div className="flex items-center gap-1 p-2 border-b border-white/5">
//                 {TOOLS.map((tool) => {
//                   const Icon     = tool.icon
//                   const isActive = activeTool === tool.id
//                   return (
//                     <button
//                       key={tool.id}
//                       onClick={() => setActiveTool(tool.id)}
//                       className={cn(
//                         'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center',
//                         isActive
//                           ? 'bg-white/10 text-white'
//                           : 'text-white/40 hover:text-white/70 hover:bg-white/5'
//                       )}
//                     >
//                       <Icon className={cn('w-4 h-4', isActive && tool.textColor)} />
//                       <span className="hidden sm:inline">{tool.label}</span>
//                     </button>
//                   )
//                 })}
//               </div>

//               {/* Prompt input */}
//               <div className="p-3">
//                 <textarea
//                   className="w-full bg-transparent text-white placeholder:text-white/30 text-sm resize-none focus:outline-none leading-relaxed"
//                   placeholder={currentTool.placeholder}
//                   value={prompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                   rows={3}
//                   disabled={isGenerating}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter' && !e.shiftKey) {
//                       e.preventDefault()
//                       handleGenerate()
//                     }
//                   }}
//                 />
//               </div>

//               {/* Bottom bar */}
//               <div className="flex items-center justify-between px-3 pb-3 gap-3">
//                 <div className="flex items-center gap-2">
//                   <span className={cn(
//                     'text-xs font-medium px-2.5 py-1 rounded-full border',
//                     activeTool === 'image'   && 'border-violet-500/30 bg-violet-500/10 text-violet-300',
//                     activeTool === 'website' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
//                     activeTool === 'video'   && 'border-rose-500/30 bg-rose-500/10 text-rose-300',
//                     activeTool === 'builder' && 'border-amber-500/30 bg-amber-500/10 text-amber-300',
//                   )}>
//                     ⚡ {currentTool.cost}
//                   </span>
//                   {activeTool !== 'video' && activeTool !== 'builder' && (
//                     <span className="text-xs text-white/30">Free · No signup</span>
//                   )}
//                   {activeTool === 'builder' && (
//                     <span className="text-xs text-white/30">Always free</span>
//                   )}
//                   {activeTool === 'video' && (
//                     <span className="text-xs text-white/30">Requires account</span>
//                   )}
//                 </div>

//                 <button
//                   onClick={handleGenerate}
//                   disabled={!prompt.trim() || isGenerating}
//                   className={cn(
//                     'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
//                     'disabled:opacity-40 disabled:cursor-not-allowed',
//                     activeTool === 'image'   && 'bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/20',
//                     activeTool === 'website' && 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20',
//                     activeTool === 'video'   && 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20',
//                     activeTool === 'builder' && 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20',
//                   )}
//                 >
//                   {isGenerating
//                     ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
//                     : <><Sparkles className="w-4 h-4" /> Generate</>
//                   }
//                 </button>
//               </div>
//             </div>

//             {/* Error */}
//             {error && (
//               <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
//                 <AlertCircle className="w-4 h-4 shrink-0" />
//                 {error}
//               </div>
//             )}

//             {/* Hint */}
//             {!hasResult && !isGenerating && (
//               <p className="text-center text-white/20 text-xs mt-4">
//                 Press Enter or click Generate · No account needed for image, website and builder
//               </p>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ── Result section ── */}
//       {(isGenerating || hasResult) && (
//         <section ref={resultRef} className="max-w-4xl mx-auto px-4 pb-16">
//           <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">

//             {/* Loading state */}
//             {isGenerating && (
//               <div className="flex flex-col items-center justify-center gap-4 py-20">
//                 <div className={cn(
//                   'w-14 h-14 rounded-2xl flex items-center justify-center',
//                   currentTool.color
//                 )}>
//                   <Loader2 className="w-7 h-7 text-white animate-spin" />
//                 </div>
//                 <div className="text-center">
//                   <p className="text-white font-medium">
//                     {activeTool === 'image'   && 'Creating your image…'}
//                     {activeTool === 'website' && 'Building your website…'}
//                     {activeTool === 'builder' && 'Analyzing your project…'}
//                   </p>
//                   <p className="text-white/40 text-sm mt-1">
//                     {activeTool === 'image'   && 'Usually 10-30 seconds'}
//                     {activeTool === 'website' && 'Usually 15-30 seconds'}
//                     {activeTool === 'builder' && 'Usually 10-20 seconds'}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Image result */}
//             {imageUrl && !isGenerating && (
//               <div className="relative group">
//                 <img
//                   src={imageUrl}
//                   alt={prompt}
//                   className="w-full max-h-[500px] object-contain bg-black"
//                 />
//                 {/* Watermark */}
//                 <div className="absolute bottom-3 right-3 bg-black/70 text-white/70 text-[10px] px-2.5 py-1 rounded-full font-medium">
//                   Studio42.ai
//                 </div>
//                 {/* Download CTA */}
//                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
//                   <Link
//                     href="/register"
//                     className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-all shadow-xl"
//                   >
//                     Sign up to download full resolution →
//                   </Link>
//                 </div>
//               </div>
//             )}

//             {/* Website result */}
//             {websiteHtml && (
//               <div>
//                 <iframe
//                   srcDoc={websiteHtml}
//                   className="w-full border-0"
//                   style={{ height: '500px' }}
//                   sandbox="allow-scripts"
//                   title="Free website preview"
//                 />
//                 <div className="p-4 border-t border-white/5 flex items-center justify-between gap-4">
//                   <p className="text-white/50 text-sm">
//                     Sign up to download without watermark
//                   </p>
//                   <Link href="/register" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all">
//                     Get 30 free credits →
//                   </Link>
//                 </div>
//               </div>
//             )}

//             {/* Builder plans result */}
//             {builderPlans.length > 0 && !isGenerating && (
//               <div className="p-5 space-y-5">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {builderPlans.map((plan) => {
//                     const isSelected = selectedPlan?.plan === plan.plan
//                     const colors: Record<string, string> = {
//                       BASIC:    'border-gray-500/30',
//                       MEDIUM:   'border-indigo-500/50',
//                       ADVANCED: 'border-violet-500/30',
//                     }
//                     const badges: Record<string, string> = {
//                       BASIC:    'bg-gray-500/20 text-gray-300',
//                       MEDIUM:   'bg-indigo-500/20 text-indigo-300',
//                       ADVANCED: 'bg-violet-500/20 text-violet-300',
//                     }
//                     return (
//                       <div
//                         key={plan.plan}
//                         onClick={() => setSelectedPlan(plan)}
//                         className={cn(
//                           'rounded-xl border p-4 cursor-pointer transition-all space-y-3',
//                           'bg-white/3 hover:bg-white/5',
//                           colors[plan.plan],
//                           isSelected && 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0a0a0f]'
//                         )}
//                       >
//                         <div className="flex items-center justify-between">
//                           <span className={cn('badge text-xs', badges[plan.plan])}>
//                             {plan.plan}
//                           </span>
//                           <span className="text-sm font-bold text-indigo-300">
//                             ~{plan.estimatedCredits} cr
//                           </span>
//                         </div>
//                         <h3 className="font-semibold text-white text-sm">{plan.title}</h3>
//                         <p className="text-xs text-white/40">{plan.description}</p>
//                         <div className="text-xs text-white/30">{plan.totalSteps} steps</div>
//                         <div className="space-y-1.5">
//                           {plan.features.slice(0, 3).map((f) => (
//                             <div key={f.id} className="flex items-center gap-1.5">
//                               <Check className="w-3 h-3 text-emerald-400 shrink-0" />
//                               <span className="text-xs text-white/60">{f.title}</span>
//                             </div>
//                           ))}
//                           {plan.features.length > 3 && (
//                             <p className="text-xs text-white/30 pl-4">
//                               +{plan.features.length - 3} more
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>

//                 {selectedPlan && (
//                   <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-5 text-center">
//                     <p className="text-indigo-200 font-semibold mb-1">
//                       Ready to build {selectedPlan.title}?
//                     </p>
//                     <p className="text-indigo-300/60 text-sm mb-4">
//                       Needs ~{selectedPlan.estimatedCredits} credits · Sign up free and get 30 to start
//                     </p>
//                     <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                       <Link
//                         href={`/register?plan=${selectedPlan.plan}&desc=${encodeURIComponent(prompt)}`}
//                         className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all"
//                       >
//                         Sign up free — start building
//                         <ArrowRight className="w-4 h-4" />
//                       </Link>
//                       <Link
//                         href="/login"
//                         className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 text-sm transition-all"
//                       >
//                         Already have an account
//                       </Link>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </section>
//       )}

//       {/* ── Scroll indicator ── */}
//       {!hasResult && !isGenerating && (
//         <div className="flex justify-center pb-8 animate-bounce">
//           <ChevronDown className="w-5 h-5 text-white/20" />
//         </div>
//       )}

//       {/* ── Tools overview ── */}
//       <section id="tools" className="py-20 px-4 border-t border-white/5">
//         <div className="max-w-5xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-black text-white mb-3">
//               Everything you need to create
//             </h2>
//             <p className="text-white/40">
//               Four powerful AI tools. One credit wallet. Pay only when you use them.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {TOOLS.map((tool) => {
//               const Icon = tool.icon
//               return (
//                 <div
//                   key={tool.id}
//                   className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-4 hover:bg-white/5 transition-all cursor-pointer group"
//                   onClick={() => {
//                     setActiveTool(tool.id)
//                     window.scrollTo({ top: 0, behavior: 'smooth' })
//                   }}
//                 >
//                   <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tool.color)}>
//                     <Icon className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
//                       {tool.label}
//                     </h3>
//                     <p className="text-xs text-white/40 mt-1 leading-relaxed">
//                       {tool.id === 'image'   && 'FLUX 1.1 Pro — photorealistic images from text'}
//                       {tool.id === 'website' && 'Complete production websites in 30 seconds'}
//                       {tool.id === 'video'   && 'Cinematic video clips up to 10 seconds'}
//                       {tool.id === 'builder' && 'Full codebases with step by step guidance'}
//                     </p>
//                   </div>
//                   <span className={cn('text-xs font-medium', tool.textColor)}>
//                     ⚡ {tool.cost}
//                   </span>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ── Comparison section ── */}
//       <section id="compare" className="py-20 px-4 border-t border-white/5">
//         <div className="max-w-5xl mx-auto">
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm font-medium mb-6">
//               <TrendingDown className="w-4 h-4" />
//               Why pay more for less?
//             </div>
//             <h2 className="text-3xl font-black text-white mb-3">
//               Stop the subscription madness
//             </h2>
//             <p className="text-white/40 max-w-xl mx-auto">
//               The average developer pays $50-100/month for AI tools they use occasionally.
//               Studio42 ends that.
//             </p>
//           </div>

//           {/* Competitor comparison table */}
//           <div className="rounded-2xl border border-white/8 overflow-hidden mb-12">
//             <div className="grid grid-cols-4 gap-0 text-xs font-semibold text-white/40 uppercase tracking-wider p-4 border-b border-white/5">
//               <div>Platform</div>
//               <div className="text-center">Price</div>
//               <div className="text-center">Tools</div>
//               <div className="text-center">Credits expire?</div>
//             </div>
//             {COMPETITORS.map((c, i) => (
//               <div
//                 key={c.name}
//                 className={cn(
//                   'grid grid-cols-4 gap-0 p-4 items-center',
//                   i !== COMPETITORS.length - 1 && 'border-b border-white/5',
//                   c.highlight && 'bg-indigo-500/10 border-indigo-500/20'
//                 )}
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="text-lg">{c.logo}</span>
//                   <span className={cn(
//                     'font-semibold text-sm',
//                     c.highlight ? 'text-white' : 'text-white/60'
//                   )}>
//                     {c.name}
//                   </span>
//                   {c.highlight && (
//                     <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">
//                       YOU
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-center">
//                   <span className={cn(
//                     'text-sm font-bold',
//                     c.highlight ? 'text-emerald-400' : 'text-rose-400'
//                   )}>
//                     {c.price}
//                   </span>
//                 </div>
//                 <div className="text-center">
//                   <span className={cn(
//                     'text-sm font-bold',
//                     c.highlight ? 'text-white' : 'text-white/50'
//                   )}>
//                     {c.tools}
//                   </span>
//                 </div>
//                 <div className="text-center">
//                   {c.locked
//                     ? <span className="text-xs text-rose-400 font-medium">✗ Yes</span>
//                     : <span className="text-xs text-emerald-400 font-medium">✓ Never</span>
//                   }
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Real world scenarios */}
//           <h3 className="text-xl font-bold text-white text-center mb-6">
//             Real world savings
//           </h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {USAGE_SCENARIOS.map((s, i) => (
//               <div
//                 key={i}
//                 className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3"
//               >
//                 <p className="text-white/70 text-sm font-medium">{s.scenario}</p>
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-white/40">Others</span>
//                     <span className="text-sm font-bold text-rose-400">{s.others}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-white/40">Studio42</span>
//                     <span className="text-sm font-bold text-emerald-400">{s.studio42}</span>
//                   </div>
//                   <div className="flex items-center justify-between pt-1 border-t border-white/5">
//                     <span className="text-xs text-white/40">You save</span>
//                     <span className="text-xs font-black text-white bg-emerald-500/20 px-2.5 py-1 rounded-full">
//                       {s.saving}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* The key difference */}
//           <div className="mt-12 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8">
//             <h3 className="text-xl font-bold text-white text-center mb-6">
//               The pay-as-you-go difference
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Subscription model */}
//               <div className="space-y-3">
//                 <h4 className="text-rose-400 font-bold text-sm flex items-center gap-2">
//                   <X className="w-4 h-4" /> Subscription model (others)
//                 </h4>
//                 {[
//                   'Pay $50/month whether you use it or not',
//                   'Credits expire at end of month',
//                   'Locked into one tool per subscription',
//                   'Cancel and lose everything immediately',
//                   'Price increases as they grow',
//                   'Vendor lock-in — hard to switch',
//                 ].map((item) => (
//                   <div key={item} className="flex items-start gap-2">
//                     <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
//                     <span className="text-white/50 text-sm">{item}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* PAYG model */}
//               <div className="space-y-3">
//                 <h4 className="text-emerald-400 font-bold text-sm flex items-center gap-2">
//                   <Check className="w-4 h-4" /> Pay as you go (Studio42)
//                 </h4>
//                 {[
//                   'Pay only when you actually create something',
//                   'Credits never expire — use them in 2 years',
//                   'All 4 tools with one credit wallet',
//                   'Stop anytime — your credits stay forever',
//                   'Price locked — credits always worth the same',
//                   'Download everything — no vendor lock-in',
//                 ].map((item) => (
//                   <div key={item} className="flex items-start gap-2">
//                     <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
//                     <span className="text-white/70 text-sm">{item}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Pricing packages ── */}
//       <section className="py-20 px-4 border-t border-white/5">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl font-black text-white mb-3">
//             Simple, honest pricing
//           </h2>
//           <p className="text-white/40 mb-12">
//             Buy once. Use whenever. 20 credits = $1. Never expires.
//           </p>

//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
//             {[
//               { credits: 100,  price: 5,  label: 'Starter',  desc: '~25 images',   popular: false },
//               { credits: 250,  price: 10, label: 'Creator',  desc: '~62 images',   popular: true  },
//               { credits: 600,  price: 20, label: 'Pro',      desc: '~150 images',  popular: false },
//               { credits: 1500, price: 40, label: 'Studio',   desc: '~375 images',  popular: false },
//             ].map((pkg) => (
//               <div
//                 key={pkg.credits}
//                 className={cn(
//                   'relative rounded-2xl border p-5 text-center',
//                   pkg.popular
//                     ? 'border-indigo-500/50 bg-indigo-500/10'
//                     : 'border-white/8 bg-white/3'
//                 )}
//               >
//                 {pkg.popular && (
//                   <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black bg-indigo-500 text-white px-3 py-1 rounded-full uppercase tracking-wide">
//                     Popular
//                   </span>
//                 )}
//                 <div className="text-2xl font-black text-white">{pkg.credits}</div>
//                 <div className="text-white/30 text-xs mb-1">credits</div>
//                 <div className="text-xs text-white/40 mb-3">{pkg.desc}</div>
//                 <div className="text-xl font-black text-indigo-300">${pkg.price}</div>
//               </div>
//             ))}
//           </div>

//           <div className="flex flex-wrap justify-center gap-4 text-sm text-white/40 mb-8">
//             {[
//               'Credits never expire',
//               'No subscription',
//               'Stripe secured',
//               'Instant delivery',
//             ].map((f) => (
//               <span key={f} className="flex items-center gap-1.5">
//                 <Check className="w-4 h-4 text-emerald-400" />{f}
//               </span>
//             ))}
//           </div>

//           <Link
//             href="/register"
//             className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-base transition-all shadow-xl shadow-indigo-500/20"
//           >
//             Start with 30 free credits
//             <ArrowRight className="w-5 h-5" />
//           </Link>
//           <p className="text-white/20 text-sm mt-3">No credit card required</p>
//         </div>
//       </section>

//       {/* ── Final CTA ── */}
//       <section className="py-20 px-4 border-t border-white/5">
//         <div className="max-w-2xl mx-auto text-center">
//           <div className="text-6xl mb-6">42</div>
//           <h2 className="text-4xl font-black text-white mb-4">
//             The answer to everything
//             <br />
//             <span className="text-white/30">you want to create.</span>
//           </h2>
//           <p className="text-white/40 mb-8">
//             In The Hitchhiker's Guide to the Galaxy, 42 is the answer to life,
//             the universe and everything. Studio42 is the answer to all your
//             AI creation needs.
//           </p>
//           <Link
//             href="/register"
//             className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-base hover:bg-gray-100 transition-all shadow-xl"
//           >
//             Get started free — it's 42 <Zap className="w-5 h-5 text-indigo-500" fill="currentColor" />
//           </Link>
//         </div>
//       </section>

//       {/* ── Footer ── */}
//       <footer className="border-t border-white/5 px-4 py-8">
//         <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
//               <span className="text-white font-black text-xs">42</span>
//             </div>
//             <span className="text-white/40 text-sm">Studio42.ai</span>
//           </div>
//           <p className="text-white/20 text-sm">
//             © {new Date().getFullYear()} Studio42 · AI tools without the subscription trap
//           </p>
//           <div className="flex items-center gap-4">
//             <Link href="/login"    className="text-white/30 hover:text-white/60 text-sm transition-colors">Sign in</Link>
//             <Link href="/register" className="text-white/30 hover:text-white/60 text-sm transition-colors">Register</Link>
//           </div>
//         </div>
//       </footer>

//     </div>
//   )
// }

'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ImageIcon, Video, Globe, Code2,
  Check, ArrowRight, Loader2, AlertCircle,
  X, ChevronDown, TrendingDown,
  Sparkles, Menu, Zap, Star,
} from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'

// ── Types ─────────────────────────────────────────────────
type Tool = 'image' | 'website' | 'video' | 'builder'

interface Plan {
  plan:             string
  title:            string
  description:      string
  features:         { id: string; title: string; description: string }[]
  steps:            { stepNumber: number; title: string; description: string }[]
  totalSteps:       number
  estimatedCredits: number
}

// ── Tool config ───────────────────────────────────────────
const TOOLS: {
  id:          Tool
  label:       string
  icon:        any
  placeholder: string
  gradient:    string
  cost:        string
  free:        boolean
}[] = [
  {
    id:          'image',
    label:       'Image',
    icon:        ImageIcon,
    placeholder: 'A majestic lion at golden hour, cinematic lighting...',
    gradient:    'from-[#7B2FBE] to-[#4F8EF7]',
    cost:        '4 credits',
    free:        true,
  },
  {
    id:          'website',
    label:       'Website',
    icon:        Globe,
    placeholder: 'A landing page for a fitness app called FitTrack for busy professionals...',
    gradient:    'from-[#4F8EF7] to-[#00C2FF]',
    cost:        '20 credits',
    free:        true,
  },
  {
    id:          'video',
    label:       'Video',
    icon:        Video,
    placeholder: 'A slow cinematic pan over misty mountains at golden hour...',
    gradient:    'from-[#7B2FBE] to-[#00C2FF]',
    cost:        '40 credits',
    free:        false,
  },
  {
    id:          'builder',
    label:       'AI Builder',
    icon:        Code2,
    placeholder: 'I want to build a food delivery app with restaurants, cart and payments...',
    gradient:    'from-[#4F8EF7] to-[#7B2FBE]',
    cost:        'Free preview',
    free:        true,
  },
]

// ── Comparison data ───────────────────────────────────────
const COMPETITORS = [
  { name: 'Midjourney', logo: '🎨', price: '$10/mo',        tools: 1, expires: true,  note: 'Images only'                      },
  { name: 'Runway',     logo: '🎬', price: '$15/mo',        tools: 1, expires: true,  note: 'Video only'                       },
  { name: 'Lovable',    logo: '💜', price: '$25/mo',        tools: 1, expires: true,  note: 'Apps only'                        },
  { name: 'All three',  logo: '😰', price: '$50/mo',        tools: 3, expires: true,  note: 'Still missing AI Builder'         },
  { name: 'Studio42',   logo: '⚡', price: 'Pay as you go', tools: 4, expires: false, note: 'All tools · credits never expire', highlight: true },
]

const SAVINGS = [
  { scenario: 'Freelancer needing 10 images for a client',  others: '$10/mo forced',  ours: '$0.50',  saving: '95% cheaper' },
  { scenario: 'Building a landing page for a startup',      others: '$25/mo Lovable', ours: '$1.00',  saving: '97% cheaper' },
  { scenario: 'Creating 5 videos for a campaign',           others: '$15/mo Runway',  ours: '$10.00', saving: '33% cheaper' },
  { scenario: 'Building a full ecommerce app',              others: '$50/mo bundle',  ours: '$12.25', saving: '75% cheaper' },
]

// ── Gradient button style ─────────────────────────────────
const gradientBtn = 'bg-gradient-to-r from-[#7B2FBE] via-[#4F8EF7] to-[#00C2FF] text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20'

// ── Main component ────────────────────────────────────────
export default function LandingPage() {
  const [activeTool,   setActiveTool]   = useState<Tool>('image')
  const [prompt,       setPrompt]       = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [mobileMenu,   setMobileMenu]   = useState(false)

  // Results
  const [imageJobId,   setImageJobId]   = useState<string | null>(null)
  const [imageUrl,     setImageUrl]     = useState<string | null>(null)
  const [imagePolling, setImagePolling] = useState(false)
  const [websiteHtml,  setWebsiteHtml]  = useState<string | null>(null)
  const [builderPlans, setBuilderPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const currentTool = TOOLS.find((t) => t.id === activeTool)!

  // Reset on tool change
  useEffect(() => {
    setImageUrl(null)
    setImageJobId(null)
    setImagePolling(false)
    setWebsiteHtml(null)
    setBuilderPlans([])
    setSelectedPlan(null)
    setError('')
    setPrompt('')
  }, [activeTool])

  // Poll image
  useEffect(() => {
    if (!imageJobId || !imagePolling) return
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/free/jobs/poll/${imageJobId}`)
        if (res.data.status === 'succeeded') {
          const out = res.data.output
          setImageUrl(Array.isArray(out) ? out[0] : out)
          setImagePolling(false)
          setLoading(false)
          clearInterval(interval)
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        } else if (res.data.status === 'failed') {
          setError('Generation failed. Please try again.')
          setImagePolling(false)
          setLoading(false)
          clearInterval(interval)
        }
      } catch { /* keep polling */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [imageJobId, imagePolling])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setImageUrl(null)
    setWebsiteHtml(null)
    setBuilderPlans([])
    setSelectedPlan(null)

    try {
      if (activeTool === 'image') {
        const res = await api.post('/free/image/generate', { prompt: prompt.trim() })
        setImageJobId(res.data.replicateId)
        setImagePolling(true)

      } else if (activeTool === 'website') {
        const res = await api.post('/free/website/generate', { prompt: prompt.trim() })
        setWebsiteHtml(res.data.html)
        setLoading(false)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

      } else if (activeTool === 'video') {
        window.location.href = `/register?redirect=video&prompt=${encodeURIComponent(prompt)}`

      } else if (activeTool === 'builder') {
        const res = await api.post('/free/builder/plan', { description: prompt.trim() })
        setBuilderPlans(res.data.plans)
        setSelectedPlan(res.data.plans[1] || res.data.plans[0])
        setLoading(false)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Generation failed.')
      setLoading(false)
    }
  }

  const hasResult    = imageUrl || websiteHtml || builderPlans.length > 0
  const isGenerating = loading || imagePolling

  return (
    <div className="min-h-screen text-white" style={{ background: '#0D0F1A' }}>

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ background: 'rgba(13,15,26,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size={44} />

          <div className="hidden md:flex items-center gap-6">
            <a href="#compare" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</a>
            <a href="#tools"   className="text-sm text-white/50 hover:text-white transition-colors">Tools</a>
            <Link href="/login"    className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className={cn('px-4 py-2 rounded-xl text-sm', gradientBtn)}>
              Start free
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-white/50 hover:text-white">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0D0F1A' }}>
            <a href="#compare" className="text-sm text-white/60 py-2">Pricing</a>
            <a href="#tools"   className="text-sm text-white/60 py-2">Tools</a>
            <Link href="/login"    className="text-sm text-white/60 py-2">Sign in</Link>
            <Link href="/register" className={cn('py-2.5 px-4 rounded-xl text-sm text-center', gradientBtn)}>
              Start free
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background glow matching brand colors */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, rgba(123,47,190,0.15) 0%, rgba(79,142,247,0.10) 50%, transparent 70%)' }}
          />
          <div className="absolute top-32 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'rgba(123,47,190,0.06)' }}
          />
          <div className="absolute top-32 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'rgba(0,194,255,0.06)' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
            style={{ borderColor: 'rgba(123,47,190,0.4)', background: 'rgba(123,47,190,0.12)', color: '#C4A8FF' }}
          >
            <Zap className="w-4 h-4" fill="currentColor" />
            No subscription · Pay as you go · Credits never expire
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-4">
            Everything you imagine.
            <br />
            <span style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 50%, #00C2FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Built by AI.
            </span>
          </h1>

          <p className="text-xl mb-3 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Images, videos, websites and complete codebases.
            One platform. One credit wallet. Pay only when you create.
          </p>

          {/* Key features row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Pay as you go
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Credits never expire
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Multiple AI models
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Full project download
            </span>
          </div>

          {/* ── Central chat box ── */}
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                border:     '1px solid rgba(123,47,190,0.25)',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 60px rgba(123,47,190,0.12), 0 0 120px rgba(79,142,247,0.06)',
              }}
            >
              {/* Tool tabs */}
              <div className="flex items-center gap-1 p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {TOOLS.map((tool) => {
                  const Icon     = tool.icon
                  const isActive = activeTool === tool.id
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center',
                        isActive ? 'text-white' : 'hover:text-white/70'
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, rgba(123,47,190,0.3), rgba(79,142,247,0.2))',
                        color: 'white',
                      } : { color: 'rgba(255,255,255,0.35)' }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={isActive ? {
                          color: activeTool === 'image'   ? '#C4A8FF' :
                                 activeTool === 'website' ? '#00C2FF' :
                                 activeTool === 'video'   ? '#A78BFA' : '#93C5FD'
                        } : {}}
                      />
                      <span className="hidden sm:inline">{tool.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Prompt */}
              <div className="p-4">
                <textarea
                  className="w-full bg-transparent text-sm resize-none focus:outline-none leading-relaxed"
                  style={{ color: 'white', caretColor: '#7B2FBE' }}
                  placeholder={currentTool.placeholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  disabled={isGenerating}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleGenerate()
                    }
                  }}
                
                />
                <style>{`textarea::placeholder { color: rgba(255,255,255,0.25); }`}</style>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: 'rgba(123,47,190,0.3)',
                      background:  'rgba(123,47,190,0.12)',
                      color:       '#C4A8FF',
                    }}
                  >
                    ⚡ {currentTool.cost}
                  </span>
                  {currentTool.free && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Free · No signup
                    </span>
                  )}
                  {!currentTool.free && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Requires account
                    </span>
                  )}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    !isGenerating && 'hover:opacity-90',
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 60%, #00C2FF 100%)',
                    boxShadow:  '0 4px 20px rgba(123,47,190,0.3)',
                  }}
                >
                  {isGenerating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                    : <><Sparkles className="w-4 h-4" /> Generate</>
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {!hasResult && !isGenerating && (
              <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.18)' }}>
                Press Enter or click Generate · Image, Website & Builder are free
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Result section ── */}
      {(isGenerating || hasResult) && (
        <section ref={resultRef} className="max-w-4xl mx-auto px-4 pb-16">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(255,255,255,0.02)' }}
          >
            {/* Loading */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}
                >
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">
                    {activeTool === 'image'   && 'Creating your image…'}
                    {activeTool === 'website' && 'Building your website…'}
                    {activeTool === 'builder' && 'Analyzing your project…'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {activeTool === 'image'   && 'Usually 10–30 seconds'}
                    {activeTool === 'website' && 'Usually 15–30 seconds'}
                    {activeTool === 'builder' && 'Usually 10–20 seconds'}
                  </p>
                </div>
              </div>
            )}

            {/* Image result */}
            {imageUrl && !isGenerating && (
              <div className="relative group">
                <img src={imageUrl} alt={prompt} className="w-full max-h-[500px] object-contain bg-black" />
                <div className="absolute bottom-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.6)' }}
                >
                  Studio42.ai
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  <Link href="/register"
                    className="bg-white text-gray-900 font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-all shadow-xl"
                  >
                    Sign up to download full resolution →
                  </Link>
                </div>
              </div>
            )}

            {/* Website result */}
            {websiteHtml && (
              <div>
                <iframe
                  srcDoc={websiteHtml}
                  className="w-full border-0"
                  style={{ height: '500px' }}
                  sandbox="allow-scripts"
                  title="Preview"
                />
                <div
                  className="p-4 flex items-center justify-between gap-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Sign up to download without watermark
                  </p>
                  <Link href="/register"
                    className="px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', color: 'white' }}
                  >
                    Get 30 free credits →
                  </Link>
                </div>
              </div>
            )}

            {/* Builder plans */}
            {builderPlans.length > 0 && !isGenerating && (
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {builderPlans.map((plan) => {
                    const isSelected = selectedPlan?.plan === plan.plan
                    return (
                      <div
                        key={plan.plan}
                        onClick={() => setSelectedPlan(plan)}
                        className="rounded-xl p-4 cursor-pointer transition-all space-y-3"
                        style={{
                          background:  isSelected ? 'rgba(123,47,190,0.12)' : 'rgba(255,255,255,0.03)',
                          border:      isSelected ? '1px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow:   isSelected ? '0 0 0 2px rgba(123,47,190,0.4)' : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(123,47,190,0.2)', color: '#C4A8FF' }}
                          >
                            {plan.plan}
                          </span>
                          <span className="text-sm font-bold" style={{ color: '#93C5FD' }}>
                            ~{plan.estimatedCredits} cr
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm">{plan.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {plan.description}
                        </p>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          {plan.totalSteps} steps
                        </div>
                        <div className="space-y-1.5">
                          {plan.features.slice(0, 3).map((f) => (
                            <div key={f.id} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{f.title}</span>
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <p className="text-xs pl-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
                              +{plan.features.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedPlan && (
                  <div
                    className="rounded-xl p-5 text-center"
                    style={{ background: 'rgba(123,47,190,0.1)', border: '1px solid rgba(123,47,190,0.2)' }}
                  >
                    <p className="font-bold text-white mb-1">
                      Ready to build {selectedPlan.title}?
                    </p>
                    <p className="text-sm mb-4" style={{ color: 'rgba(196,168,255,0.7)' }}>
                      Needs ~{selectedPlan.estimatedCredits} credits · Sign up free and get 30 to start
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href={`/register?plan=${selectedPlan.plan}&desc=${encodeURIComponent(prompt)}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7, #00C2FF)' }}
                      >
                        Sign up free — start building
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        Already have an account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Scroll hint */}
      {!hasResult && !isGenerating && (
        <div className="flex justify-center pb-8 animate-bounce">
          <ChevronDown className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
      )}

      {/* ── Tools section ── */}
      <section id="tools" className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">
              Everything you need to create
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>
              Four powerful AI tools. One credit wallet. Pay only when you use them.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <div
                  key={tool.id}
                  className="rounded-2xl p-5 space-y-4 cursor-pointer group transition-all"
                  style={{
                    border:     '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(123,47,190,0.08)'
                    e.currentTarget.style.borderColor = 'rgba(123,47,190,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  }}
                  onClick={() => {
                    setActiveTool(tool.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${tool.gradient.includes('7B2FBE') ? '#7B2FBE' : '#4F8EF7'}, ${tool.gradient.includes('00C2FF') ? '#00C2FF' : '#7B2FBE'})` }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{tool.label}</h3>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {tool.id === 'image'   && 'FLUX 1.1 Pro — photorealistic images from text'}
                      {tool.id === 'website' && 'Complete production websites in 30 seconds'}
                      {tool.id === 'video'   && 'Cinematic video clips up to 10 seconds'}
                      {tool.id === 'builder' && 'Full codebases with step by step guidance'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#93C5FD' }}>
                    ⚡ {tool.cost}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section id="compare" className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-6"
              style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#FCA5A5' }}
            >
              <TrendingDown className="w-4 h-4" />
              Why pay more for less?
            </div>
            <h2 className="text-3xl font-black text-white mb-3">
              Stop the subscription madness
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              The average developer pays $50–100/month for AI tools they use occasionally.
              Studio42 ends that.
            </p>
          </div>

          {/* Comparison table */}
          <div className="rounded-2xl overflow-hidden mb-12" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Header */}
            <div
              className="grid grid-cols-4 gap-0 p-4 text-xs font-bold uppercase tracking-wider"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
            >
              <div>Platform</div>
              <div className="text-center">Price</div>
              <div className="text-center">Tools</div>
              <div className="text-center">Credits expire?</div>
            </div>

            {COMPETITORS.map((c, i) => (
              <div
                key={c.name}
                className="grid grid-cols-4 gap-0 p-4 items-center"
                style={{
                  borderBottom: i !== COMPETITORS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background:   (c as any).highlight ? 'rgba(123,47,190,0.08)' : 'transparent',
                  borderLeft:   (c as any).highlight ? '3px solid #7B2FBE' : '3px solid transparent',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.logo}</span>
                  <span className={cn('font-semibold text-sm', (c as any).highlight ? 'text-white' : 'text-white/50')}>
                    {c.name}
                  </span>
                  {(c as any).highlight && (
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', color: 'white' }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <span className={cn('text-sm font-bold', (c as any).highlight ? 'text-emerald-400' : 'text-rose-400')}>
                    {c.price}
                  </span>
                </div>
                <div className="text-center">
                  <span className={cn('text-sm font-bold', (c as any).highlight ? 'text-white' : 'text-white/40')}>
                    {c.tools}
                  </span>
                </div>
                <div className="text-center">
                  {c.expires
                    ? <span className="text-xs text-rose-400 font-semibold">✗ Yes</span>
                    : <span className="text-xs text-emerald-400 font-semibold">✓ Never</span>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Real savings */}
          <h3 className="text-xl font-black text-white text-center mb-6">Real world savings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAVINGS.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 space-y-3"
                style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-sm font-medium text-white/70">{s.scenario}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Others</span>
                    <span className="text-sm font-bold text-rose-400">{s.others}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Studio42</span>
                    <span className="text-sm font-bold text-emerald-400">{s.ours}</span>
                  </div>
                  <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>You save</span>
                    <span
                      className="text-xs font-black px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}
                    >
                      {s.saving}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAYG vs subscription */}
          <div
            className="mt-12 rounded-2xl p-8"
            style={{ border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(123,47,190,0.05)' }}
          >
            <h3 className="text-xl font-black text-white text-center mb-8">
              The pay-as-you-go difference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-rose-400 font-bold text-sm flex items-center gap-2">
                  <X className="w-4 h-4" /> Subscription model
                </h4>
                {[
                  'Pay $50/month whether you use it or not',
                  'Credits expire at end of month',
                  'Locked into one tool per subscription',
                  'Cancel and lose everything immediately',
                  'Price increases as platform grows',
                  'Vendor lock-in — hard to switch',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" /> Pay as you go (Studio42)
                </h4>
                {[
                  'Pay only when you actually create something',
                  'Credits never expire — use them in 2 years',
                  'All 4 tools with one credit wallet',
                  'Stop anytime — your credits stay forever',
                  'Price locked — credits always worth the same',
                  'Download everything — zero vendor lock-in',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3">Simple, honest pricing</h2>
          <p className="mb-12" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Buy once. Use whenever. 20 credits = $1. Never expires.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { credits: 100,  price: 5,  desc: '~25 images',  popular: false },
              { credits: 250,  price: 10, desc: '~62 images',  popular: true  },
              { credits: 600,  price: 20, desc: '~150 images', popular: false },
              { credits: 1500, price: 40, desc: '~375 images', popular: false },
            ].map((pkg) => (
              <div
                key={pkg.credits}
                className="relative rounded-2xl p-5 text-center"
                style={{
                  border:     pkg.popular ? '1px solid rgba(123,47,190,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  background: pkg.popular ? 'rgba(123,47,190,0.1)' : 'rgba(255,255,255,0.02)',
                }}
              >
                {pkg.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide"
                    style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', color: 'white' }}
                  >
                    Popular
                  </span>
                )}
                <div className="text-2xl font-black text-white">{pkg.credits}</div>
                <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>credits</div>
                <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{pkg.desc}</div>
                <div
                  className="text-xl font-black"
                  style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  ${pkg.price}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {['Credits never expire', 'No subscription', 'Stripe secured', 'Instant delivery'].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />{f}
              </span>
            ))}
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base"
            style={{
              background: 'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 60%, #00C2FF 100%)',
              boxShadow:  '0 8px 32px rgba(123,47,190,0.3)',
            }}
          >
            Start with 30 free credits
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>No credit card required</p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 text-center relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px]"
            style={{ background: 'rgba(123,47,190,0.1)' }}
          />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <Logo size={80} />
          <div className="mt-4 mb-2 text-6xl font-black text-white">Studio42</div>
          <p
            className="text-lg mb-4 font-medium"
            style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7, #00C2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Everything you imagine. Built by AI.
          </p>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            In The Hitchhiker's Guide, 42 is the answer to life, the universe
            and everything. Studio42 is the answer to all your AI creation needs.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-2xl"
          >
            Get started free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={36} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Studio42.ai · Everything you imagine. Built by AI.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login"    className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>Sign in</Link>
            <Link href="/register" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>Register</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}