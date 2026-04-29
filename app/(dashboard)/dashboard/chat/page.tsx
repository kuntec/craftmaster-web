'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, MessageSquare, Trash2,
  Loader2, ChevronRight,
} from 'lucide-react'
import { chatApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Conversation, ChatModel } from '@/types/chat'
import { formatRelative } from '@/lib/utils'

const MODEL_COLORS: Record<string, string> = {
  openai:    '#10A37F',
  anthropic: '#D97706',
  google:    '#4F8EF7',
}

const MODEL_LABELS: Record<string, string> = {
  'gpt-4o':       'GPT-4o',
  'gpt-4o-mini':  'GPT-4o mini',
  'claude-sonnet': 'Claude Sonnet',
  'claude-haiku':  'Claude Haiku',
  'gemini-pro':    'Gemini Pro',
  'gemini-flash':  'Gemini Flash',
}

export default function ChatPage() {
  const router = useRouter()
  const user   = useAuthStore(s => s.user)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [models,        setModels]        = useState<ChatModel[]>([])
  const [loading,       setLoading]       = useState(true)
  const [creating,      setCreating]      = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')

  useEffect(() => {
    Promise.all([
      chatApi.listConversations(),
      chatApi.getModels(),
    ]).then(([convRes, modelsRes]) => {
      setConversations(convRes.data.conversations)
      setModels(modelsRes.data.models)
    }).finally(() => setLoading(false))
  }, [])

  const handleNewChat = async () => {
    setCreating(true)
    try {
      const res = await chatApi.createConversation(selectedModel)
      router.push(`/dashboard/chat/${res.data.conversation._id}`)
    } catch {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await chatApi.deleteConversation(id)
    setConversations(prev => prev.filter(c => c._id !== id))
  }

  // Group conversations by date
  const today     = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  const groups: Record<string, Conversation[]> = {}
  conversations.forEach(c => {
    const d = new Date(c.updatedAt).toDateString()
    const key = d === today ? 'Today'
              : d === yesterday ? 'Yesterday'
              : new Date(c.updatedAt).toLocaleDateString('en', { month: 'long', day: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(c)
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="page-subtitle">
            Chat with the world's best AI models
          </p>
        </div>
      </div>

      {/* New chat card */}
      <div
        className="card p-6 space-y-4"
        style={{ border: '1px solid rgba(123,47,190,0.2)', background: 'rgba(123,47,190,0.05)' }}
      >
        <h3 className="font-semibold text-white text-sm">Start a new conversation</h3>

        {/* Model selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {models.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedModel(m.id)}
              className="p-3 rounded-xl text-left transition-all"
              style={{
                background:   selectedModel === m.id ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                border:       selectedModel === m.id ? `1px solid ${m.color}40` : '1px solid rgba(255,255,255,0.08)',
                outline:      selectedModel === m.id ? `2px solid ${m.color}30` : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{m.name}</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${m.color}20`, color: m.color }}
                >
                  {m.badge}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {m.provider}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: '#C4A8FF' }}>
                  ⚡ {m.credits} cr/msg
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Credits check */}
        {user && (user.creditsBalance ?? 0) < (models.find(m => m.id === selectedModel)?.credits ?? 1) && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}
          >
            Insufficient credits. Top up to start chatting.
          </div>
        )}

        <button
          onClick={handleNewChat}
          disabled={creating}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {creating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
            : <><Plus className="w-4 h-4" /> New conversation</>
          }
        </button>
      </div>

      {/* Conversation list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7B2FBE' }} />
        </div>
      ) : conversations.length === 0 ? (
        <div
          className="card p-12 text-center"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-white font-medium text-sm">No conversations yet</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Start a new conversation above
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([date, convs]) => (
            <div key={date}>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {date}
              </p>
              <div className="space-y-1">
                {convs.map(conv => {
                  const modelColor = models.find(m => m.id === conv.modelId)?.color || '#7B2FBE'
                  return (
                    <div
                      key={conv._id}
                      onClick={() => router.push(`/dashboard/chat/${conv._id}`)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group transition-all"
                      style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${modelColor}18` }}
                      >
                        <MessageSquare className="w-4 h-4" style={{ color: modelColor }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {conv.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {MODEL_LABELS[conv.modelId] || conv.modelId}
                          </span>
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {formatRelative(conv.updatedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={e => handleDelete(conv._id, e)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}