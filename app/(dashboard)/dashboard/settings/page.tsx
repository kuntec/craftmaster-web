'use client'
import { useState } from 'react'
import {
  User,
  Lock,
  Gift,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Trash2,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'security' | 'referral'

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore()

  const [tab, setTab] = useState<Tab>('profile')

  // Profile state
  const [name,          setName]          = useState(user?.name || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg,    setProfileMsg]    = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Password state
  const [currentPw,   setCurrentPw]   = useState('')
  const [newPw,       setNewPw]       = useState('')
  const [confirmPw,   setConfirmPw]   = useState('')
  const [pwLoading,   setPwLoading]   = useState(false)
  const [pwMsg,       setPwMsg]       = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Referral state
  const [copied,      setCopied]      = useState(false)
  const [codeCopied,  setCodeCopied]  = useState(false)

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user?.referralCode}`

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile',  label: 'Profile',  icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'referral', label: 'Referral', icon: Gift },
  ]

  // ── Profile save ──────────────────────────────────────
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setProfileLoading(true)
    setProfileMsg(null)

    try {
      await authApi.updateProfile({ name: name.trim() })
      updateUser({ name: name.trim() })
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch (err: any) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update profile',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  // ── Password save ─────────────────────────────────────
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(null)

    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setPwLoading(true)
    try {
      await authApi.updatePassword({
        currentPassword: currentPw,
        newPassword:     newPw,
      })
      setPwMsg({ type: 'success', text: 'Password updated successfully' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err: any) {
      setPwMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update password',
      })
    } finally {
      setPwLoading(false)
    }
  }

  // ── Delete account ────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await authApi.deleteAccount()
      logout()
    } catch (err: any) {
      setDeleteLoading(false)
      setDeleteConfirm(false)
    }
  }

  // ── Copy helpers ──────────────────────────────────────
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(user?.referralCode || '')
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Tab bar ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Profile tab ── */}
      {tab === 'profile' && (
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-gray-900">
            Profile information
          </h3>

          <form onSubmit={handleProfileSave} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            {/* Email — read only */}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input opacity-60 cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Email cannot be changed
              </p>
            </div>

            {/* Plan */}
            <div>
              <label className="label">Plan</label>
              <div className="flex items-center gap-2">
                <span className="badge badge-info capitalize px-3 py-1 text-sm">
                  {user?.plan?.toLowerCase() || 'free'}
                </span>
              </div>
            </div>

            {/* Message */}
            {profileMsg && (
              <div className={cn(
                'flex items-center gap-2 p-3 rounded-lg text-sm border',
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              )}>
                {profileMsg.type === 'success'
                  ? <Check        className="w-4 h-4 shrink-0" />
                  : <AlertCircle  className="w-4 h-4 shrink-0" />
                }
                {profileMsg.text}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={profileLoading}
            >
              {profileLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : 'Save changes'
              }
            </button>
          </form>
        </div>
      )}

      {/* ── Security tab ── */}
      {tab === 'security' && (
        <div className="space-y-5">
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold text-gray-900">
              Change password
            </h3>

            <form onSubmit={handlePasswordSave} className="space-y-4">
              {/* Current password */}
              <div>
                <label className="label">Current password</label>
                <input
                  type="password"
                  className="input"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* New password */}
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  className="input"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
              </div>

              {/* Confirm password */}
              <div>
                <label className="label">Confirm new password</label>
                <input
                  type="password"
                  className="input"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Message */}
              {pwMsg && (
                <div className={cn(
                  'flex items-center gap-2 p-3 rounded-lg text-sm border',
                  pwMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                )}>
                  {pwMsg.type === 'success'
                    ? <Check       className="w-4 h-4 shrink-0" />
                    : <AlertCircle className="w-4 h-4 shrink-0" />
                  }
                  {pwMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={pwLoading || !currentPw || !newPw || !confirmPw}
              >
                {pwLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                  : 'Update password'
                }
              </button>
            </form>
          </div>

          {/* ── Danger zone ── */}
          <div className="card p-6 border-red-200">
            <h3 className="font-semibold text-gray-900 mb-1">
              Danger zone
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Permanently deactivate your account and lose access to all your data.
            </p>

            {!deleteConfirm
              ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="btn-danger"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-600">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="btn-danger"
                    >
                      {deleteLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                        : 'Yes, delete my account'
                      }
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* ── Referral tab ── */}
      {tab === 'referral' && (
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-gray-900">
            Referral program
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
              <div className="text-2xl font-bold text-indigo-700">20</div>
              <div className="text-xs text-indigo-600 mt-1">
                credits you earn
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-2xl font-bold text-emerald-700">20</div>
              <div className="text-xs text-emerald-600 mt-1">
                credits they get
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Share your referral link. When someone signs up using it,
            you both receive{' '}
            <strong className="text-indigo-600">20 free credits</strong>{' '}
            instantly.
          </p>

          {/* Referral link */}
          <div>
            <label className="label">Your referral link</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={referralUrl}
                className="input text-xs cursor-pointer"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopyLink}
                className="btn-secondary text-xs shrink-0"
              >
                {copied
                  ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                  : <><Copy  className="w-3.5 h-3.5" /> Copy</>
                }
              </button>
            </div>
          </div>

          {/* Referral code */}
          <div>
            <label className="label">Your referral code</label>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 font-mono text-sm font-medium tracking-widest text-gray-900">
                {user?.referralCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="btn-secondary text-xs shrink-0"
              >
                {codeCopied
                  ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                  : <><Copy  className="w-3.5 h-3.5" /> Copy</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}