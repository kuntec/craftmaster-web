'use client'
import { useEffect, useState } from 'react'
import {
  Search, MoreVertical, Plus, Minus,
  Ban, Trash2, Eye, ChevronLeft,
  ChevronRight, Loader2, Check, X,
} from 'lucide-react'
import { adminUsersApi } from '@/lib/adminApi'
import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface User {
  _id:               string
  name:              string
  email:             string
  creditsBalance:    number
  isActive:          boolean
  createdAt:         string
  totalSpendUsd:     number
  totalSpendCredits: number
  googleId?:         string
}

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<User[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [total,    setTotal]    = useState(0)

  // Credit adjustment modal
  const [creditModal, setCreditModal] = useState<{ user: User; type: 'add' | 'deduct' } | null>(null)
  const [creditAmt,   setCreditAmt]   = useState('')
  const [creditNote,  setCreditNote]  = useState('')
  const [creditLoading, setCreditLoading] = useState(false)

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await adminUsersApi.list({ page, limit: 20, search })
      setUsers(res.data.users)
      setPages(res.data.pagination.pages)
      setTotal(res.data.pagination.total)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { loadUsers() }, [page, search])

  const handleAdjustCredits = async () => {
    if (!creditModal || !creditAmt) return
    setCreditLoading(true)
    try {
      const amount = creditModal.type === 'add'
        ? parseInt(creditAmt)
        : -parseInt(creditAmt)
      await adminUsersApi.adjustCredits(creditModal.user._id, {
        amount,
        reason: creditNote || 'Admin adjustment',
      })
      setCreditModal(null)
      setCreditAmt('')
      setCreditNote('')
      loadUsers()
    } catch {}
    finally { setCreditLoading(false) }
  }

  const handleBan = async (id: string) => {
    await adminUsersApi.ban(id)
    loadUsers()
  }

  const handleDelete = async (id: string) => {
    await adminUsersApi.delete(id)
    setDeleteConfirm(null)
    loadUsers()
  }

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Users</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {total} registered users
          </p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none w-64"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header row */}
        <div className="grid text-xs font-bold uppercase tracking-wider px-5 py-3"
          style={{
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr auto',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.3)',
          }}>
          <div>User</div>
          <div>Email</div>
          <div>Credits</div>
          <div>Spent</div>
          <div>Status</div>
          <div>Joined</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7B2FBE' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No users found
          </div>
        ) : (
          users.map((user, i) => (
            <div
              key={user._id}
              className="grid items-center px-5 py-3.5"
              style={{
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr auto',
                borderBottom: i !== users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate max-w-[120px]">{user.name}</p>
                  {user.googleId && (
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Google</span>
                  )}
                </div>
              </div>

              {/* Email */}
              <p className="text-sm truncate max-w-[160px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {user.email}
              </p>

              {/* Credits */}
              <p className="text-sm font-bold" style={{ color: '#C4A8FF' }}>
                {user.creditsBalance.toLocaleString()}
              </p>

              {/* Spent */}
              <p className="text-sm font-bold" style={{ color: '#34D399' }}>
                ${user.totalSpendUsd}
              </p>

              {/* Status */}
              <span
                className="text-xs font-semibold px-2 py-1 rounded-lg inline-flex items-center gap-1 w-fit"
                style={user.isActive
                  ? { background: 'rgba(16,185,129,0.12)', color: '#34D399' }
                  : { background: 'rgba(239,68,68,0.12)',  color: '#FCA5A5' }
                }
              >
                {user.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {user.isActive ? 'Active' : 'Banned'}
              </span>

              {/* Joined */}
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {formatRelative(user.createdAt)}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Add credits */}
                <button
                  onClick={() => { setCreditModal({ user, type: 'add' }); setCreditAmt(''); setCreditNote('') }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  title="Add credits"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#34D399' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Deduct credits */}
                <button
                  onClick={() => { setCreditModal({ user, type: 'deduct' }); setCreditAmt(''); setCreditNote('') }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  title="Deduct credits"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Ban/unban */}
                <button
                  onClick={() => handleBan(user._id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  title={user.isActive ? 'Ban user' : 'Unban user'}
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#FCD34D' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteConfirm(user._id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  title="Delete user"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm disabled:opacity-40 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === pages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm disabled:opacity-40 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Credit adjustment modal */}
      {creditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setCreditModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: '#0D0F1A', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">
              {creditModal.type === 'add' ? 'Add Credits' : 'Deduct Credits'}
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              User: {creditModal.user.name} ({creditModal.user.email})
              <br />
              Current balance: {creditModal.user.creditsBalance} credits
            </p>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Amount (credits)
              </label>
              <input
                type="number"
                value={creditAmt}
                onChange={e => setCreditAmt(e.target.value)}
                min="1"
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Reason
              </label>
              <input
                type="text"
                value={creditNote}
                onChange={e => setCreditNote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="Promotional credits, refund, etc."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCreditModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustCredits}
                disabled={!creditAmt || creditLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: creditModal.type === 'add'
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : 'linear-gradient(135deg, #EF4444, #DC2626)',
                }}
              >
                {creditLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : creditModal.type === 'add' ? 'Add Credits' : 'Deduct Credits'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: '#0D0F1A', border: '1px solid rgba(239,68,68,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">Delete User</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              This will permanently delete the user and all their data.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}