// 'use client'
// import { useState } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
// import { authApi } from '@/lib/api'
// import { useAuthStore } from '@/store/auth'

// export default function LoginPage() {
//   const router   = useRouter()
//   const setAuth  = useAuthStore((s) => s.setAuth)

//   const [email,    setEmail]    = useState('')
//   const [password, setPassword] = useState('')
//   const [showPw,   setShowPw]   = useState(false)
//   const [loading,  setLoading]  = useState(false)
//   const [error,    setError]    = useState('')


//   const fillDemo = () => {
//     setEmail('demo@craftmaster.ai')
//     setPassword('demo123456')
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const res = await authApi.login({ email, password })
//       setAuth(res.data.user, res.data.token)
//       router.push('/dashboard')
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Login failed. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="card p-8">
//       <h2 className="text-xl font-semibold text-gray-900 mb-1">
//         Welcome back
//       </h2>
//       <p className="text-gray-500 text-sm mb-6">
//         Sign in to your account
//       </p>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Email */}
//         <div>
//           <label className="label">Email</label>
//           <input
//             type="email"
//             className="input"
//             placeholder="you@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             autoFocus
//           />
//         </div>

//         {/* Password */}
//         <div>
//           <label className="label">Password</label>
//           <div className="relative">
//             <input
//               type={showPw ? 'text' : 'password'}
//               className="input pr-10"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPw(!showPw)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//             >
//               {showPw
//                 ? <EyeOff className="w-4 h-4" />
//                 : <Eye    className="w-4 h-4" />
//               }
//             </button>


//           </div>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//             <AlertCircle className="w-4 h-4 shrink-0" />
//             {error}
//           </div>
//         )}

//                     {/* Demo login */}
// <button
//   type="button"
//   onClick={fillDemo}
//   className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-500 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-400 transition-all"
// >
//   🧪 Fill demo credentials
// </button>

//         {/* Submit */}
//         <button
//           type="submit"
//           className="btn-primary w-full py-2.5"
//           disabled={loading}
//         >
//           {loading
//             ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
//             : 'Sign in'
//           }
//         </button>
//       </form>

//       <p className="text-center text-sm text-gray-500 mt-6">
//         Don't have an account?{' '}
//         <Link
//           href="/register"
//           className="text-indigo-600 font-medium hover:underline"
//         >
//           Create one free
//         </Link>
//       </p>
//     </div>
//   )
// }

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import GoogleButton from '@/components/auth/GoogleButton'

export default function LoginPage() {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const fillDemo = () => {
    setEmail('demo@studio42.ai')
    setPassword('demo123456')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login({ email, password })
      setAuth(res.data.user, res.data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Welcome back
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Sign in to your account
      </p>

      {/* Google Sign In */}
      <GoogleButton />

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">
          or continue with email
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Demo button */}
        <button
          type="button"
          onClick={fillDemo}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-500 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-400 transition-all"
        >
          🧪 Try demo account
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-2.5"
          disabled={loading}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
            : 'Sign in'
          }
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link href="/register" className="text-indigo-600 font-medium hover:underline">
          Create one free
        </Link>
      </p>
    </div>
  )
}