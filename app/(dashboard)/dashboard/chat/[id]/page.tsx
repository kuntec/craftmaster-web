'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Send, Loader2,
  ChevronDown, Copy, Check,
  RotateCcw, Zap,
} from 'lucide-react'
import { chatApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Conversation, ChatModel } from '@/types/chat'
import { cn } from '@/lib/utils'
import Cookies from 'js-cookie'

// ── Markdown-like renderer ────────────────────────────────
function MessageContent({ content }: { content: string }) {
  const formatted = content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')

  return (
    <div
      className="message-content"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  )
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params.id as string

  const { user, updateUser } = useAuthStore()

  const [conversation,  setConversation]  = useState<Conversation | null>(null)
  const [models,        setModels]        = useState<ChatModel[]>([])
  const [loading,       setLoading]       = useState(true)
  const [sending,       setSending]       = useState(false)
  const [input,         setInput]         = useState('')
  const [streamText,    setStreamText]    = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [showModels,    setShowModels]    = useState(false)
  const [copied,        setCopied]        = useState<number | null>(null)
  const [error,         setError]         = useState('')

  const bottomRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load conversation + models
  useEffect(() => {
    Promise.all([
      chatApi.getConversation(id),
      chatApi.getModels(),
    ]).then(([convRes, modelsRes]) => {
      setConversation(convRes.data.conversation)
      setSelectedModel(convRes.data.conversation.modelId)
      setModels(modelsRes.data.models)
    }).catch(() => router.push('/dashboard/chat'))
    .finally(() => setLoading(false))
  }, [id])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages, streamText])

  const currentModel = models.find(m => m.id === selectedModel)

  const handleSend = async () => {
    if (!input.trim() || sending) return
    if (!user || (user.creditsBalance ?? 0) < (currentModel?.credits ?? 1)) {
      setError('Insufficient credits. Please top up.')
      return
    }

    const userMessage = input.trim()
    setInput('')
    setSending(true)
    setStreamText('')
    setError('')

    // Optimistically add user message
    setConversation(prev => {
      if (!prev) return prev
      return {
        ...prev,
        messages: [...prev.messages, {
          role:      'user',
          content:   userMessage,
          createdAt: new Date().toISOString(),
        }],
      }
    })

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const token  = Cookies.get('cm_token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      const response = await fetch(
        `${apiUrl}/chat/conversations/${id}/message`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: userMessage,
            model:   selectedModel,
          }),
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to send message')
      }

      // Read stream
      const reader   = response.body!.getReader()
      const decoder  = new TextDecoder()
      let   fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text  = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.error) throw new Error(data.error)
            if (data.chunk) {
              fullText += data.chunk
              setStreamText(fullText)
            }
            if (data.done) {
              setConversation(prev => {
                if (!prev) return prev
                return {
                  ...prev,
                  messages: [...prev.messages, {
                    role:      'assistant',
                    content:   fullText,
                    model:     selectedModel,
                    credits:   currentModel?.credits,
                    createdAt: new Date().toISOString(),
                  }],
                }
              })
              setStreamText('')
              updateUser({
                creditsBalance: (user.creditsBalance ?? 0) - (currentModel?.credits ?? 1),
              })
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      // Remove optimistic user message on error
      setConversation(prev => {
        if (!prev) return prev
        return { ...prev, messages: prev.messages.slice(0, -1) }
      })
    } finally {
      setSending(false)
      setStreamText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!conversation) return null

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -m-6">

      {/* ── Styles ── */}
      <style>{`
        .message-content {
          font-size: 14px;
          line-height: 1.7;
          color: #111827;
        }
        .message-content strong { color: #111827; font-weight: 600; }
        .message-content em { font-style: italic; color: #374151; }
        .code-block {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 16px;
          margin: 8px 0;
          overflow-x: auto;
          font-size: 13px;
          font-family: 'Fira Code', 'Consolas', monospace;
          color: #1f2937;
          white-space: pre;
        }
        .inline-code {
          background: #f3f4f6;
          border-radius: 4px;
          padding: 1px 6px;
          font-family: monospace;
          font-size: 13px;
          color: #6366f1;
        }
      `}</style>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/chat')}
            className="btn-ghost text-sm -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300">·</span>
          <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">
            {conversation.title}
          </p>
        </div>

        {/* Credits */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200">
          <Zap className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" />
          <span className="text-xs font-bold text-indigo-600">
            {user?.creditsBalance ?? 0} credits
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50">

        {/* Empty state */}
        {conversation.messages.length === 0 && !streamText && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}
            >
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Start the conversation</p>
              <p className="text-sm text-gray-400 mt-1">Type a message below to begin</p>
            </div>
            {/* Starter prompts */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mt-2">
              {[
                'Explain quantum computing simply',
                'Write a Python web scraper',
                'Review my marketing strategy',
                'Help me debug this code',
                'Write a professional email',
                'Summarize this topic',
              ].map(p => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="px-3 py-1.5 rounded-xl text-xs text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {conversation.messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {/* Assistant avatar */}
            {msg.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${
                    models.find(m => m.id === (msg.model || selectedModel))?.color || '#6366f1'
                  }, #6366f1)`,
                }}
              >
                AI
              </div>
            )}

            {/* Message bubble */}
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3 relative group',
                msg.role === 'user'
                  ? 'rounded-tr-sm text-white'
                  : 'rounded-tl-sm bg-white border border-gray-200 shadow-sm'
              )}
              style={msg.role === 'user' ? {
                background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)',
              } : {}}
            >
              {msg.role === 'user' ? (
                <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'white' }}>
                  {msg.content}
                </p>
              ) : (
                <MessageContent content={msg.content} />
              )}

              {/* Copy button for assistant */}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleCopy(msg.content, i)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-gray-100 hover:bg-gray-200"
                >
                  {copied === i
                    ? <Check className="w-3 h-3 text-emerald-500" />
                    : <Copy  className="w-3 h-3 text-gray-500" />
                  }
                </button>
              )}

              {/* Credits used */}
              {msg.role === 'assistant' && msg.credits && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                  <Zap className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] text-gray-400">
                    {msg.credits} credits
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamText && (
          <div className="flex gap-3 justify-start">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${currentModel?.color || '#6366f1'}, #6366f1)` }}
            >
              AI
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-gray-200 shadow-sm">
              <MessageContent content={streamText} />
              <span
                className="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm bg-indigo-400"
                style={{ verticalAlign: 'middle' }}
              />
            </div>
          </div>
        )}

        {/* Thinking dots */}
        {sending && !streamText && (
          <div className="flex gap-3 justify-start">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${currentModel?.color || '#6366f1'}, #6366f1)` }}
            >
              AI
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 bg-white border border-gray-200 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {currentModel?.name} is thinking…
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div className="shrink-0 px-6 py-4 bg-white border-t border-gray-200">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-3 bg-red-50 border border-red-200 text-red-600">
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Model selector */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <button
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              style={{
                background:   `${currentModel?.color || '#6366f1'}12`,
                borderColor:  `${currentModel?.color || '#6366f1'}30`,
                color:        currentModel?.color || '#6366f1',
              }}
            >
              <span>{currentModel?.name || 'Select model'}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: `${currentModel?.color}20` }}
              >
                ⚡ {currentModel?.credits} cr
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Model dropdown */}
            {showModels && (
              <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl overflow-hidden shadow-xl z-20 bg-white border border-gray-200">
                {models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(m.id); setShowModels(false) }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-all border-b border-gray-100 last:border-0"
                    style={{
                      background: selectedModel === m.id ? `${m.color}08` : 'white',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${m.color}06` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = selectedModel === m.id ? `${m.color}08` : 'white' }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: `${m.color}15`, color: m.color }}
                      >
                        {m.badge}
                      </span>
                      <p className="text-[10px] mt-1" style={{ color: m.color }}>
                        ⚡ {m.credits} cr/msg
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs text-gray-400">
            Balance: {user?.creditsBalance ?? 0} credits
          </span>
        </div>

        {/* Text input */}
        <div className="flex items-end gap-3 rounded-2xl px-4 py-3 bg-gray-50 border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${currentModel?.name || 'AI'}…`}
            disabled={sending}
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-900 resize-none focus:outline-none placeholder:text-gray-400"
            style={{ minHeight: '24px', maxHeight: '200px', lineHeight: '1.6' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)',
              boxShadow:  '0 4px 12px rgba(123,47,190,0.3)',
            }}
          >
            {sending
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send    className="w-4 h-4 text-white" />
            }
          </button>
        </div>

        <p className="text-center text-[11px] mt-2 text-gray-400">
          Press Enter to send · Shift+Enter for new line · Switch models anytime
        </p>
      </div>

    </div>
  )
}