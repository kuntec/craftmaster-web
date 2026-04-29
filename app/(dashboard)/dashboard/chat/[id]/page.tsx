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
import { Conversation, Message, ChatModel } from '@/types/chat'
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

// ── Model badge ───────────────────────────────────────────
const PROVIDER_COLORS: Record<string, string> = {
  openai:    '#10A37F',
  anthropic: '#D97706',
  google:    '#4F8EF7',
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params.id as string

  const { user, updateUser } = useAuthStore()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [models,       setModels]       = useState<ChatModel[]>([])
  const [loading,      setLoading]      = useState(true)
  const [sending,      setSending]      = useState(false)
  const [input,        setInput]        = useState('')
  const [streamText,   setStreamText]   = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [showModels,   setShowModels]   = useState(false)
  const [copied,       setCopied]       = useState<number | null>(null)
  const [error,        setError]        = useState('')

  const bottomRef  = useRef<HTMLDivElement>(null)
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

  // Scroll to bottom
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

    // Resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const token = Cookies.get('cm_token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      const response = await fetch(
        `${apiUrl}/chat/conversations/${id}/message`,
        {
          method: 'POST',
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
      const reader  = response.body!.getReader()
      const decoder = new TextDecoder()
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
              // Add assistant message to conversation
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

              // Deduct credits from local store
              updateUser({
                creditsBalance: (user.creditsBalance ?? 0) - (currentModel?.credits ?? 1),
              })
            }
          } catch (parseErr) {
            // skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      // Remove optimistic message on error
      setConversation(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: prev.messages.slice(0, -1),
        }
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
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7B2FBE' }} />
      </div>
    )
  }

  if (!conversation) return null

  const allMessages = conversation.messages

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -m-6">

      <style>{`
        .message-content { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.85); }
        .message-content strong { color: white; font-weight: 600; }
        .message-content em { font-style: italic; }
        .code-block {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          margin: 8px 0;
          overflow-x: auto;
          font-size: 13px;
          font-family: 'Fira Code', monospace;
          color: #e2e8f0;
        }
        .inline-code {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 1px 6px;
          font-family: monospace;
          font-size: 13px;
          color: #C4A8FF;
        }
      `}</style>

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,15,26,0.95)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/chat')}
            className="flex items-center gap-1.5 text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <p className="text-sm font-semibold text-white truncate max-w-xs">
            {conversation.title}
          </p>
        </div>

        {/* Credits display */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(123,47,190,0.12)', border: '1px solid rgba(123,47,190,0.25)' }}
        >
          <Zap className="w-3.5 h-3.5" fill="currentColor" style={{ color: '#C4A8FF' }} />
          <span className="text-xs font-bold" style={{ color: '#C4A8FF' }}>
            {user?.creditsBalance ?? 0} credits
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {allMessages.length === 0 && !streamText && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}
            >
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Start the conversation</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Type a message below to begin
              </p>
            </div>
            {/* Starter prompts */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mt-2">
              {[
                'Explain quantum computing simply',
                'Write a Python web scraper',
                'Review my marketing strategy',
                'Help me debug this code',
                'Write a professional email',
                'Summarize this article',
              ].map(p => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border:     '1px solid rgba(255,255,255,0.08)',
                    color:      'rgba(255,255,255,0.5)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(123,47,190,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {allMessages.map((msg, i) => (
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
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${
                    models.find(m => m.id === (msg.model || selectedModel))?.color || '#7B2FBE'
                  }, #4F8EF7)`,
                }}
              >
                AI
              </div>
            )}

            {/* Message bubble */}
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3 relative group',
                msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
              )}
              style={msg.role === 'user' ? {
                background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)',
                color: 'white',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {msg.role === 'user' ? (
                <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'white' }}>
                  {msg.content}
                </p>
              ) : (
                <MessageContent content={msg.content} />
              )}

              {/* Copy button for assistant messages */}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleCopy(msg.content, i)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {copied === i
                    ? <Check className="w-3 h-3" style={{ color: '#34D399' }} />
                    : <Copy className="w-3 h-3" />
                  }
                </button>
              )}

              {/* Credits used */}
              {msg.role === 'assistant' && msg.credits && (
                <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <Zap className="w-3 h-3" style={{ color: '#C4A8FF' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
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
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${currentModel?.color || '#7B2FBE'}, #4F8EF7)` }}
            >
              AI
            </div>
            <div
              className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <MessageContent content={streamText} />
              <span
                className="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm"
                style={{ background: '#7B2FBE', verticalAlign: 'middle' }}
              />
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {sending && !streamText && (
          <div className="flex gap-3 justify-start">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${currentModel?.color || '#7B2FBE'}, #4F8EF7)` }}
            >
              AI
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: '#7B2FBE',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {currentModel?.name} is thinking…
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,15,26,0.95)' }}
      >
        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl text-sm mb-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}
          >
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Model selector */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <button
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: `${currentModel?.color || '#7B2FBE'}18`,
                border:     `1px solid ${currentModel?.color || '#7B2FBE'}30`,
                color:      currentModel?.color || '#C4A8FF',
              }}
            >
              <span>{currentModel?.name || 'Select model'}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: `${currentModel?.color}25` }}
              >
                ⚡ {currentModel?.credits} cr
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showModels && (
              <div
                className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl overflow-hidden shadow-2xl z-20"
                style={{ background: '#0D0F1A', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(m.id); setShowModels(false) }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-all"
                    style={{
                      background: selectedModel === m.id ? `${m.color}12` : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${m.color}10` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = selectedModel === m.id ? `${m.color}12` : 'transparent' }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{m.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{m.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: `${m.color}20`, color: m.color }}
                      >
                        {m.badge}
                      </span>
                      <p className="text-[10px] mt-1" style={{ color: '#C4A8FF' }}>
                        ⚡ {m.credits} cr/msg
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Balance: {user?.creditsBalance ?? 0} credits
          </span>
        </div>

        {/* Text input */}
        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${currentModel?.name || 'AI'}…`}
            disabled={sending}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white resize-none focus:outline-none"
            style={{
              minHeight:   '24px',
              maxHeight:   '200px',
              lineHeight:  '1.6',
              color:       'white',
            }}
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
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>

        <p className="text-center text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Press Enter to send · Shift+Enter for new line · Switch models anytime
        </p>
      </div>
    </div>
  )
}