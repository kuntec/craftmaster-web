'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface Props {
  referralCode?: string
}

export default function GoogleButton({ referralCode }: Props) {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const btnRef  = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')
      return
    }

    // Check if already loaded
    if (window.google) {
      initGoogle(clientId)
      return
    }

    // Load Google SDK script
    const script    = document.createElement('script')
    script.src      = 'https://accounts.google.com/gsi/client'
    script.async    = true
    script.defer    = true
    script.onload   = () => initGoogle(clientId)
    script.onerror  = () => console.error('Failed to load Google SDK')
    document.head.appendChild(script)

    return () => {
      // Cleanup
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existing) document.head.removeChild(existing)
    }
  }, [])

  const initGoogle = (clientId: string) => {
    if (!window.google || !btnRef.current) return

    window.google.accounts.id.initialize({
      client_id:               clientId,
      callback:                handleCredentialResponse,
      auto_select:             false,
      cancel_on_tap_outside:   true,
    })

    window.google.accounts.id.renderButton(
      btnRef.current,
      {
        theme:          'filled_black',
        size:           'large',
        width:          btnRef.current.offsetWidth || 400,
        text:           'continue_with',
        shape:          'rectangular',
        logo_alignment: 'left',
      }
    )
  }

  const handleCredentialResponse = async (response: { credential: string }) => {
    setLoading(true)
    setError('')
    try {
      const res = await authApi.google({
        idToken:      response.credential,
        referralCode: referralCode || undefined,
      })
      setAuth(res.data.user, res.data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          Signing in with Google…
        </div>
      ) : (
        <div ref={btnRef} className="w-full" />
      )}

      {error && (
        <p className="text-xs text-red-500 text-center mt-2">{error}</p>
      )}
    </div>
  )
}

// Extend window type
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize:   (config: any) => void
          renderButton: (el: HTMLElement, config: any) => void
          prompt:       () => void
          cancel:       () => void
        }
      }
    }
  }
}