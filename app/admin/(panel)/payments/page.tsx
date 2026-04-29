'use client'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, DollarSign } from 'lucide-react'
import { adminPaymentsApi } from '@/lib/adminApi'
import { formatRelative } from '@/lib/utils'

interface Transaction {
  _id:         string
  userId:      { name: string; email: string }
  amount:      number
  usd:         number
  description: string
  createdAt:   string
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading,      setLoading]      = useState(true)
  const [page,         setPage]         = useState(1)
  const [pages,        setPages]        = useState(1)
  const [total,        setTotal]        = useState(0)

  useEffect(() => {
    setLoading(true)
    adminPaymentsApi.list({ page, limit: 20 })
      .then(res => {
        setTransactions(res.data.transactions)
        setPages(res.data.pagination.pages)
        setTotal(res.data.pagination.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  const totalRevenue = transactions.reduce((sum, t) => sum + t.usd, 0)

  return (
    <div className="space-y-5 max-w-5xl">

      <div>
        <h1 className="text-2xl font-black text-white">Payments</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {total} total transactions
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid px-5 py-3 text-xs font-bold uppercase tracking-wider"
          style={{
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.3)',
          }}>
          <div>User</div>
          <div>Description</div>
          <div>Credits</div>
          <div>Amount</div>
          <div>Date</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7B2FBE' }} />
          </div>
        ) : transactions.map((t, i) => (
          <div key={t._id}
            className="grid items-center px-5 py-3.5"
            style={{
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
              borderBottom: i !== transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <div>
              <p className="text-sm font-semibold text-white">{t.userId?.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.userId?.email}</p>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.description}</p>
            <p className="text-sm font-bold" style={{ color: '#C4A8FF' }}>+{t.amount}</p>
            <p className="text-sm font-bold" style={{ color: '#34D399' }}>${t.usd.toFixed(2)}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatRelative(t.createdAt)}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Page {page} of {pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === pages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}