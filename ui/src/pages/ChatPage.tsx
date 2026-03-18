import { useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Activity, Bot, CircleX, CornerDownLeft, Cpu, Database, GitBranch, Sparkles, Square } from 'lucide-react'
import { createSseJsonParser } from '../lib/sse'

type ToolCall = {
  tool_name: string
  args: Record<string, unknown>
  tool_call_id?: string | null
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  tools?: ToolCall[]
  createdAt: number
  isStreaming?: boolean
}

type SessionState = {
  sessionId: string | null
}

function formatJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

function safeToolCalls(payload: unknown): ToolCall[] | null {
  if (!payload || typeof payload !== 'object') return null

  const maybe =
    (payload as { tools?: unknown }).tools ?? (payload as { tools_used?: unknown }).tools_used
  if (!Array.isArray(maybe)) return null

  const tools: ToolCall[] = []
  for (const item of maybe) {
    if (!item || typeof item !== 'object') continue
    const tool_name = (item as { tool_name?: unknown }).tool_name
    const args = (item as { args?: unknown }).args
    const tool_call_id = (item as { tool_call_id?: unknown }).tool_call_id

    if (typeof tool_name !== 'string') continue
    tools.push({
      tool_name,
      args: typeof args === 'object' && args ? (args as Record<string, unknown>) : {},
      tool_call_id: typeof tool_call_id === 'string' ? tool_call_id : null,
    })
  }

  return tools
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ask me anything about your ingested documents. I can use vector search, graph search, or a hybrid of both—and I’ll show you the tools I used.',
      createdAt: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[] | null>(null)
  const [session, setSession] = useState<SessionState>(() => {
    const existing = localStorage.getItem('agentic_rag_session_id')
    return { sessionId: existing && existing.trim() ? existing : null }
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === 'assistant') return messages[i]
    }
    return null
  }, [messages])

  useEffect(() => {
    checkHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkHealth() {
    try {
      const res = await fetch('/health')
      setIsConnected(res.ok)
    } catch {
      setIsConnected(false)
    }
  }

  function stopStreaming() {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
    setMessages((prev) => {
      const next = [...prev]
      for (let i = next.length - 1; i >= 0; i -= 1) {
        const m = next[i]
        if (m?.role === 'assistant' && m.isStreaming) {
          next[i] = { ...m, isStreaming: false }
          break
        }
      }
      return next
    })
  }

  async function onSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    if (isStreaming) return

    const now = Date.now()
    const assistantId = crypto.randomUUID()
    setMessages((prev) => {
      return [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', content: trimmed, createdAt: now },
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt: now + 1,
          isStreaming: true,
        },
      ]
    })
    setInput('')
    setActiveToolCalls(null)
    setIsStreaming(true)

    const ac = new AbortController()
    abortRef.current = ac

    try {
      const res = await fetch('/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          session_id: session.sessionId,
          user_id: 'ui',
          search_type: 'hybrid',
        }),
        signal: ac.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`Streaming failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const parser = createSseJsonParser()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        if (!value) continue

        const text = decoder.decode(value, { stream: true })
        const events = parser.push(text)

        for (const ev of events) {
          if (ev.type === 'session' && typeof ev.session_id === 'string') {
            localStorage.setItem('agentic_rag_session_id', ev.session_id)
            setSession({ sessionId: ev.session_id })
            continue
          }

          if (ev.type === 'text' && typeof ev.content === 'string') {
            setMessages((prev) => {
              const next = [...prev]
              const idx = next.findIndex((m) => m.id === assistantId)
              if (idx === -1) return prev
              const m = next[idx]!
              next[idx] = { ...m, content: (m.content ?? '') + ev.content }
              return next
            })
            continue
          }

          if (ev.type === 'tools') {
            const tools = safeToolCalls(ev)
            if (tools?.length) {
              setMessages((prev) => {
                const next = [...prev]
                const idx = next.findIndex((m) => m.id === assistantId)
                if (idx === -1) return prev
                next[idx] = { ...next[idx]!, tools }
                return next
              })
              setActiveToolCalls(tools)
            }
            continue
          }

          if (ev.type === 'error') {
            const msg =
              typeof ev.error === 'string'
                ? ev.error
                : typeof (ev as unknown as { content?: unknown }).content === 'string'
                  ? (ev as unknown as { content: string }).content
                  : 'Streaming error'
            setMessages((prev) => {
              const next = [...prev]
              const idx = next.findIndex((m) => m.id === assistantId)
              if (idx === -1) return prev
              const m = next[idx]!
              next[idx] = { ...m, content: m.content ? `${m.content}\n\n${msg}` : msg }
              return next
            })
            continue
          }

          if (ev.type === 'end') {
            // Finalize below.
          }
        }
      }
    } catch (e) {
      if ((e as { name?: string }).name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev]
          const idx = next.findIndex((m) => m.id === assistantId)
          if (idx === -1) return prev
          const m = next[idx]!
          const msg = `I couldn’t stream the response. ${String(e)}`
          next[idx] = { ...m, content: m.content ? `${m.content}\n\n${msg}` : msg }
          return next
        })
      }
    } finally {
      abortRef.current = null
      setIsStreaming(false)
      setMessages((prev) => {
        const next = [...prev]
        const idx = next.findIndex((m) => m.id === assistantId)
        if (idx === -1) return prev
        next[idx] = { ...next[idx]!, isStreaming: false }
        return next
      })
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      <div className="mx-auto grid min-h-dvh max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[280px_1fr_360px]">
        <aside className="border-b border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm">
              <Sparkles className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-100">Agentic RAG</div>
              <div className="truncate text-xs text-zinc-400">Vector + Knowledge Graph</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={checkHealth}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/70"
              type="button"
            >
              <span className="flex items-center gap-2">
                <Activity className="size-4 text-zinc-300" />
                Health check
              </span>
              <span
                className={clsx(
                  'rounded-full px-2 py-0.5 text-xs',
                  isConnected === null && 'bg-zinc-800 text-zinc-200',
                  isConnected === true && 'bg-emerald-500/15 text-emerald-300',
                  isConnected === false && 'bg-rose-500/15 text-rose-300',
                )}
              >
                {isConnected === null ? 'unknown' : isConnected ? 'ok' : 'down'}
              </span>
            </button>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-zinc-200">Session</div>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-800 bg-zinc-950/30 px-2 py-1 text-[11px] text-zinc-200 hover:bg-zinc-950/60"
                  onClick={() => {
                    localStorage.removeItem('agentic_rag_session_id')
                    setSession({ sessionId: null })
                    setMessages((prev) => [prev[0]!])
                    setActiveToolCalls(null)
                  }}
                  title="Start a new session"
                >
                  New
                </button>
              </div>
              <div className="mt-2 truncate rounded-lg bg-zinc-950/40 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-800/70">
                {session.sessionId ?? '—'}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                <Cpu className="size-4 text-zinc-300" />
                Capabilities
              </div>
              <ul className="mt-2 space-y-2 text-xs text-zinc-400">
                <li className="flex items-center gap-2">
                  <Database className="size-4 text-zinc-400" />
                  pgvector semantic search
                </li>
                <li className="flex items-center gap-2">
                  <GitBranch className="size-4 text-zinc-400" />
                  Graphiti/Neo4j facts & timelines
                </li>
                <li className="flex items-center gap-2">
                  <Bot className="size-4 text-zinc-400" />
                  Tool-aware answers
                </li>
              </ul>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 flex-col border-b border-zinc-800/80 lg:border-b-0">
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-100">Chat</div>
              <div className="truncate text-xs text-zinc-400">
                Streaming responses will appear in real time.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMessages((prev) => [prev[0]!])
                setActiveToolCalls(null)
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900/60"
              title="Clear conversation"
            >
              <CircleX className="size-4 text-zinc-300" />
              Clear
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={clsx(
                    'group flex gap-3',
                    m.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  {m.role === 'assistant' && (
                    <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-900/60 ring-1 ring-zinc-800/80">
                      <Bot className="size-4 text-zinc-200" />
                    </div>
                  )}

                  <div
                    className={clsx(
                      'max-w-[850px] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ring-1',
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-zinc-50 ring-violet-500/20'
                        : 'bg-zinc-900/40 text-zinc-100 ring-zinc-800/70',
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {m.content || (m.isStreaming ? '…' : '')}
                    </div>
                    {m.tools?.length ? (
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-950/70"
                        onClick={() => setActiveToolCalls(m.tools ?? null)}
                      >
                        <span className="font-medium">Tools used</span>
                        <span className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-200">
                          {m.tools.length}
                        </span>
                      </button>
                    ) : null}
                  </div>

                  {m.role === 'user' && (
                    <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/90 to-fuchsia-500/90 shadow-sm">
                      <CornerDownLeft className="size-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void onSend()
                }}
                placeholder="Ask a question… (Ctrl+Enter to send)"
                className="min-h-[48px] w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="button"
                onClick={() => void onSend()}
                disabled={isStreaming}
                className={clsx(
                  'inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white shadow-sm',
                  isStreaming
                    ? 'cursor-not-allowed bg-zinc-800 text-zinc-200'
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400',
                )}
              >
                Send
              </button>
              <button
                type="button"
                onClick={stopStreaming}
                disabled={!isStreaming}
                className={clsx(
                  'inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold shadow-sm',
                  isStreaming
                    ? 'border-zinc-700 bg-zinc-900/40 text-zinc-100 hover:bg-zinc-900/70'
                    : 'cursor-not-allowed border-zinc-800 bg-zinc-950/30 text-zinc-500',
                )}
                title="Stop streaming"
              >
                <Square className="size-4" />
                Stop
              </button>
            </div>
            <div className="mx-auto mt-3 max-w-3xl text-xs text-zinc-500">
              Tip: Ask relationship questions like “How is Microsoft connected to OpenAI?” to trigger graph tools.
            </div>
          </div>
        </main>

        <aside className="border-l border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Cpu className="size-4 text-zinc-200" />
              Tools
            </div>
            <button
              type="button"
              className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-900/60"
              onClick={() => setActiveToolCalls(null)}
              disabled={!activeToolCalls}
              title="Clear tool panel"
            >
              Clear
            </button>
          </div>

          <div className="mt-4">
            {activeToolCalls?.length ? (
              <div className="space-y-3">
                {activeToolCalls.map((t, idx) => (
                  <div key={`${t.tool_call_id ?? 'tool'}-${idx}`} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 truncate text-xs font-semibold text-zinc-100">
                        {t.tool_name}
                      </div>
                      {t.tool_call_id ? (
                        <div className="shrink-0 rounded-md bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-200">
                          {t.tool_call_id}
                        </div>
                      ) : null}
                    </div>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-zinc-950/40 p-2 text-[11px] leading-relaxed text-zinc-200 ring-1 ring-zinc-800/70">
                      {formatJson(t.args)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 p-4 text-xs text-zinc-400">
                Tool calls will appear here after an assistant response.
                <div className="mt-2 text-[11px] text-zinc-500">
                  For now this is UI scaffolding; streaming + tool extraction will be wired next.
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/20 p-3">
            <div className="text-xs font-semibold text-zinc-100">Latest assistant</div>
            <div className="mt-2 text-xs text-zinc-400">
              {lastAssistant ? (
                <div className="line-clamp-6 whitespace-pre-wrap">{lastAssistant.content || '…'}</div>
              ) : (
                '—'
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

