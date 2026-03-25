import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import {
  Activity,
  Bot,
  ChevronDown,
  CircleX,
  CornerDownLeft,
  Cpu,
  Database,
  GitBranch,
  Loader2,
  Layers,
  Menu,
  Network,
  Send,
  Sparkles,
  Square,
  X,
} from 'lucide-react'

type TabMode = 'graph' | 'vector' | 'agentic'
import { createSseJsonParser } from '../lib/sse'
import { GraphVisualization } from '../components/GraphVisualization'

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

const TAB_CONFIG: { key: TabMode; label: string; icon: typeof Network; description: string }[] = [
  {
    key: 'graph',
    label: 'Graph',
    icon: Network,
    description: 'Ask about relationships, entities, or timelines (e.g. How is Microsoft connected to OpenAI?).',
  },
  {
    key: 'vector',
    label: 'Vector',
    icon: Database,
    description: "Ask for factual content or document retrieval (e.g. What is Meta's AI strategy?).",
  },
  {
    key: 'agentic',
    label: 'Agentic',
    icon: Layers,
    description: 'Ask anything; the agent will choose the best tools automatically.',
  },
]

function formatJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

/**
 * Formats a timestamp into a short readable time string.
 *
 * Args:
 *   ts (number): Unix timestamp in milliseconds.
 *
 * Returns:
 *   string: Formatted time string like "2:30 PM".
 */
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
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

/**
 * Streaming dots indicator shown while the assistant is generating a response.
 */
function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Assistant is typing">
      <span className="size-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
    </span>
  )
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ask me anything about your ingested documents. I can use vector search, graph search, or a hybrid of both—and I\u2019ll show you the tools I used.',
      createdAt: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[] | null>(null)
  const [graphData, setGraphData] = useState<{
    nodes: { id: string; label: string; type?: string }[]
    edges: { source: string; target: string; type?: string }[]
  } | null>(null)
  const [graphLoading, setGraphLoading] = useState(false)
  const [session, setSession] = useState<SessionState>(() => {
    const existing = localStorage.getItem('agentic_rag_session_id')
    return { sessionId: existing && existing.trim() ? existing : null }
  })
  const [activeTab, setActiveTab] = useState<TabMode>('agentic')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === 'assistant') return messages[i]
    }
    return null
  }, [messages])

  // Reason: Auto-scroll to bottom when new messages arrive or content streams in
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reason: Show/hide scroll-to-bottom button based on scroll position
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return
    function onScroll() {
      if (!container) return
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      setShowScrollBtn(!atBottom)
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    checkHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reason: Auto-resize the textarea as user types multi-line input
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [input])

  async function checkHealth() {
    try {
      const res = await fetch('/health')
      setIsConnected(res.ok)
    } catch {
      setIsConnected(false)
    }
  }

  const graphSearchQuery = useMemo(() => {
    if (!activeToolCalls) return null
    const g = activeToolCalls.find((t) => t.tool_name === 'graph_search')
    const q = g?.args?.query
    return typeof q === 'string' && q.trim() ? q.trim() : null
  }, [activeToolCalls])

  const graphEntityName = useMemo(() => {
    if (!activeToolCalls) return null
    const t = activeToolCalls.find(
      (t) =>
        t.tool_name === 'get_entity_relationships' || t.tool_name === 'get_entity_timeline',
    )
    const name = t?.args?.entity_name
    return typeof name === 'string' && name.trim() ? name.trim() : null
  }, [activeToolCalls])

  const canShowGraphViz = Boolean(graphSearchQuery || graphEntityName)

  const fetchGraphVisualization = useCallback(async () => {
    const query = graphSearchQuery
    const entityName = graphEntityName
    if (!query && !entityName) return
    setGraphLoading(true)
    setGraphData(null)
    try {
      let res: Response
      if (query) {
        res = await fetch('/search/graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, search_type: 'graph', limit: 10 }),
        })
      } else {
        res = await fetch('/search/graph/entity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity_name: entityName, max_neighbors: 20 }),
        })
      }
      if (!res.ok) throw new Error('Graph fetch failed')
      const data = (await res.json()) as {
        graph_data?: { nodes?: unknown[]; edges?: unknown[] }
      }
      const gd = data.graph_data
      if (gd?.nodes?.length || gd?.edges?.length) {
        setGraphData({
          nodes: (gd.nodes ?? []) as { id: string; label: string; type?: string }[],
          edges: (gd.edges ?? []) as { source: string; target: string; type?: string }[],
        })
      } else {
        setGraphData(null)
      }
    } catch {
      setGraphData(null)
    } finally {
      setGraphLoading(false)
    }
  }, [graphSearchQuery, graphEntityName])

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
          search_type:
            activeTab === 'graph' ? 'graph' : activeTab === 'vector' ? 'vector' : 'hybrid',
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
          const msg = `I couldn\u2019t stream the response. ${String(e)}`
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
      // Reason: Refocus textarea after send so user can keep typing
      textareaRef.current?.focus()
    }
  }

  /** Handle keyboard navigation for the tab bar (arrow keys). */
  function handleTabKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = TAB_CONFIG.map((t) => t.key)
    const idx = keys.indexOf(activeTab)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = keys[(idx + 1) % keys.length]!
      setActiveTab(next)
      // Reason: Move DOM focus to the newly selected tab button
      const btn = (e.currentTarget as HTMLElement).querySelector<HTMLButtonElement>(
        `[data-tab="${next}"]`,
      )
      btn?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = keys[(idx - 1 + keys.length) % keys.length]!
      setActiveTab(prev)
      const btn = (e.currentTarget as HTMLElement).querySelector<HTMLButtonElement>(
        `[data-tab="${prev}"]`,
      )
      btn?.focus()
    }
  }

  const activeTabConfig = TAB_CONFIG.find((t) => t.key === activeTab)

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      {/* Skip to main content link for keyboard/screen reader users */}
      <a
        href="#chat-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="mx-auto grid min-h-dvh max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[280px_1fr_360px]">
        {/* ── Mobile header with hamburger ── */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/60 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="size-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">Agentic RAG</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2 text-zinc-200 hover:bg-zinc-900/70"
            aria-label={sidebarOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* ── Left sidebar ── */}
        <aside
          className={clsx(
            'border-b border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur transition-all duration-200 lg:border-b-0 lg:border-r lg:block',
            sidebarOpen ? 'block' : 'hidden',
          )}
          aria-label="Application sidebar"
        >
          <div className="flex items-center gap-3">
            <div
              className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm"
              aria-hidden="true"
            >
              <Sparkles className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-zinc-100">Agentic RAG</h1>
              <p className="truncate text-xs text-zinc-400">Vector + Knowledge Graph</p>
            </div>
          </div>

          <nav className="mt-6 space-y-3" aria-label="Sidebar controls">
            <button
              onClick={checkHealth}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              type="button"
              aria-label={`Health check — status: ${isConnected === null ? 'unknown' : isConnected ? 'ok' : 'down'}`}
            >
              <span className="flex items-center gap-2">
                <Activity className="size-4 text-zinc-300" aria-hidden="true" />
                Health check
              </span>
              <span
                className={clsx(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  isConnected === null && 'bg-zinc-800 text-zinc-200',
                  isConnected === true && 'bg-emerald-500/15 text-emerald-300',
                  isConnected === false && 'bg-rose-500/15 text-rose-300',
                )}
                role="status"
                aria-live="polite"
              >
                {isConnected === null ? 'unknown' : isConnected ? 'ok' : 'down'}
              </span>
            </button>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-200" id="session-label">
                  Session
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-800 bg-zinc-950/30 px-2 py-1 text-[11px] text-zinc-200 transition-colors hover:bg-zinc-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  onClick={() => {
                    localStorage.removeItem('agentic_rag_session_id')
                    setSession({ sessionId: null })
                    setMessages((prev) => [prev[0]!])
                    setActiveToolCalls(null)
                  }}
                  aria-label="Start a new session"
                >
                  New
                </button>
              </div>
              <div
                className="mt-2 truncate rounded-lg bg-zinc-950/40 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-800/70"
                aria-labelledby="session-label"
              >
                {session.sessionId ?? '\u2014'}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                <Cpu className="size-4 text-zinc-300" aria-hidden="true" />
                Capabilities
              </div>
              <ul className="mt-2 space-y-2 text-xs text-zinc-400" aria-label="System capabilities">
                <li className="flex items-center gap-2">
                  <Database className="size-4 text-zinc-400" aria-hidden="true" />
                  pgvector semantic search
                </li>
                <li className="flex items-center gap-2">
                  <GitBranch className="size-4 text-zinc-400" aria-hidden="true" />
                  Graphiti/Neo4j facts &amp; timelines
                </li>
                <li className="flex items-center gap-2">
                  <Bot className="size-4 text-zinc-400" aria-hidden="true" />
                  Tool-aware answers
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* ── Main chat area ── */}
        <main id="chat-main" className="flex min-h-0 flex-col border-b border-zinc-800/80 lg:border-b-0">
          {/* Header + tabs */}
          <div className="flex flex-col gap-3 border-b border-zinc-800/80 px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-zinc-100">Chat</h2>
                <p className="truncate text-xs text-zinc-400">
                  Streaming responses will appear in real time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMessages((prev) => [prev[0]!])
                  setActiveToolCalls(null)
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-xs text-zinc-200 transition-colors hover:bg-zinc-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                aria-label="Clear conversation"
              >
                <CircleX className="size-4 text-zinc-300" aria-hidden="true" />
                Clear
              </button>
            </div>

            {/* Accessible tab bar with ARIA roles and keyboard navigation */}
            <div
              className="flex gap-1 rounded-xl bg-zinc-900/60 p-1"
              role="tablist"
              aria-label="Search mode"
              onKeyDown={handleTabKeyDown}
            >
              {TAB_CONFIG.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    id={`tab-${tab.key}`}
                    data-tab={tab.key}
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.key}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.key)}
                    className={clsx(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60',
                      isActive
                        ? 'bg-violet-500/30 text-violet-200 ring-1 ring-violet-500/50'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chat messages area */}
          <div
            ref={chatContainerRef}
            className="relative min-h-0 flex-1 overflow-y-auto scroll-smooth px-4 py-6 sm:px-5"
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            aria-live="polite"
          >
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
                    <div
                      className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-900/60 ring-1 ring-zinc-800/80"
                      aria-hidden="true"
                    >
                      <Bot className="size-4 text-zinc-200" />
                    </div>
                  )}

                  <div
                    className={clsx(
                      'max-w-[min(850px,85%)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ring-1',
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-zinc-50 ring-violet-500/20'
                        : 'bg-zinc-900/40 text-zinc-100 ring-zinc-800/70',
                    )}
                  >
                    {/* Screen reader prefix for role context */}
                    <span className="sr-only">{m.role === 'user' ? 'You said' : 'Assistant said'}:</span>

                    <div className="whitespace-pre-wrap">
                      {m.content || (m.isStreaming ? <TypingIndicator /> : '')}
                    </div>

                    {/* Streaming indicator inside bubble */}
                    {m.isStreaming && m.content && (
                      <div className="mt-1">
                        <TypingIndicator />
                      </div>
                    )}

                    {m.tools?.length ? (
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-200 transition-colors hover:bg-zinc-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                        onClick={() => {
                          setActiveToolCalls(m.tools ?? null)
                          setGraphData(null)
                        }}
                        aria-label={`View ${m.tools.length} tool calls used`}
                      >
                        <span className="font-medium">Tools used</span>
                        <span className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-200">
                          {m.tools.length}
                        </span>
                      </button>
                    ) : null}

                    {/* Timestamp */}
                    <div
                      className={clsx(
                        'mt-1.5 text-[10px]',
                        m.role === 'user' ? 'text-violet-300/50' : 'text-zinc-500',
                      )}
                    >
                      <time dateTime={new Date(m.createdAt).toISOString()}>
                        {formatTime(m.createdAt)}
                      </time>
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div
                      className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/90 to-fuchsia-500/90 shadow-sm"
                      aria-hidden="true"
                    >
                      <CornerDownLeft className="size-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {/* Invisible anchor for auto-scrolling */}
              <div ref={chatEndRef} aria-hidden="true" />
            </div>

            {/* Scroll-to-bottom floating button */}
            {showScrollBtn && (
              <button
                type="button"
                onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="sticky bottom-4 left-1/2 z-10 mx-auto flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-200 shadow-lg backdrop-blur transition-colors hover:bg-zinc-800"
                aria-label="Scroll to latest message"
              >
                <ChevronDown className="size-3.5" aria-hidden="true" />
                New messages
              </button>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-zinc-800/80 bg-zinc-950/60 p-4 backdrop-blur sm:p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void onSend()
              }}
              className="mx-auto flex max-w-3xl items-end gap-3"
            >
              <label htmlFor="chat-input" className="sr-only">
                Type your question
              </label>
              <textarea
                ref={textareaRef}
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault()
                    void onSend()
                  }
                }}
                rows={1}
                placeholder="Ask a question\u2026 (Ctrl+Enter to send)"
                className="min-h-[48px] max-h-[160px] w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                disabled={isStreaming}
                aria-describedby="input-hint"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className={clsx(
                  'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60',
                  isStreaming || !input.trim()
                    ? 'cursor-not-allowed bg-zinc-800 text-zinc-400'
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400',
                )}
                aria-label="Send message"
              >
                <Send className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Send</span>
              </button>
              {isStreaming && (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/40 px-4 text-sm font-semibold text-zinc-100 shadow-sm transition-colors hover:bg-zinc-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  aria-label="Stop streaming response"
                >
                  <Square className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              )}
            </form>
            <p id="input-hint" className="mx-auto mt-3 max-w-3xl text-xs text-zinc-500">
              {activeTabConfig?.description ?? ''}
            </p>
          </div>
        </main>

        {/* ── Right sidebar: Tools panel ── */}
        <aside
          className="hidden border-l border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur lg:block"
          aria-label="Tool calls panel"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Cpu className="size-4 text-zinc-200" aria-hidden="true" />
              Tools
            </h2>
            <button
              type="button"
              className={clsx(
                'rounded-lg border border-zinc-800 bg-zinc-900/30 px-2 py-1 text-xs text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60',
                activeToolCalls ? 'hover:bg-zinc-900/60' : 'cursor-not-allowed opacity-50',
              )}
              onClick={() => {
                setActiveToolCalls(null)
                setGraphData(null)
              }}
              disabled={!activeToolCalls}
              aria-label="Clear tool panel"
            >
              Clear
            </button>
          </div>

          <div className="mt-4">
            {activeToolCalls?.length ? (
              <div className="space-y-3" role="list" aria-label="Active tool calls">
                {canShowGraphViz && (
                  <button
                    type="button"
                    onClick={() => void fetchGraphVisualization()}
                    disabled={graphLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 transition-colors hover:bg-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:opacity-50"
                    aria-label={graphLoading ? 'Loading graph visualization' : 'Show traversal path visualization'}
                  >
                    {graphLoading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Network className="size-4" aria-hidden="true" />
                    )}
                    {graphLoading ? 'Loading\u2026' : 'Show traversal path'}
                  </button>
                )}
                {graphData && (
                  <GraphVisualization
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    width={328}
                    height={280}
                    onClose={() => setGraphData(null)}
                  />
                )}
                {activeToolCalls.map((t, idx) => (
                  <div
                    key={`${t.tool_call_id ?? 'tool'}-${idx}`}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3"
                    role="listitem"
                  >
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
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 p-6 text-center">
                <Cpu className="size-8 text-zinc-700" aria-hidden="true" />
                <div>
                  <p className="text-xs text-zinc-400">No tool calls yet</p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Tool calls will appear here when the assistant uses search tools to answer your questions.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/20 p-3">
            <h3 className="text-xs font-semibold text-zinc-100">Latest assistant</h3>
            <div className="mt-2 text-xs text-zinc-400">
              {lastAssistant ? (
                <p className="line-clamp-6 whitespace-pre-wrap">
                  {lastAssistant.content || '\u2026'}
                </p>
              ) : (
                '\u2014'
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
