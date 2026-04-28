'use client'
import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import GoogleButton from '@/components/auth/GoogleButton'

const PERKS = [
  '30 free credits on signup',
  'No subscription required',
  'Credits never expire',
]

function RegisterForm() {
  const router  = useRouter()
  const params  = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const referralCode = params.get('ref') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await authApi.register({
        name,
        email,
        password,
        referralCode: referralCode || undefined,
      })
      setAuth(res.data.user, res.data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Perks */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {PERKS.map((p) => (
          <span
            key={p}
            className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200"
          >
            <Check className="w-3 h-3" />
            {p}
          </span>
        ))}
      </div>

      <div className="card p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Create your account
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Start with 30 free credits — no card needed
        </p>

        {/* Google Sign Up */}
<GoogleButton referralCode={referralCode} />

{/* Divider */}
<div className="flex items-center gap-3 my-5">
  <div className="flex-1 h-px bg-gray-200" />
  <span className="text-xs text-gray-400 font-medium">
    or sign up with email
  </span>
  <div className="flex-1 h-px bg-gray-200" />
</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">Full name</label>
            <input
              type="text"
              className="input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye    className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          {/* Referral code applied */}
          {referralCode && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              <Check className="w-4 h-4 shrink-0" />
              Referral code applied — you'll get +20 bonus credits!
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full py-2.5"
            disabled={loading}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
              : 'Create free account'
            }
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        By signing up you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

// Wrap in Suspense — required for useSearchParams in Next.js 14
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}