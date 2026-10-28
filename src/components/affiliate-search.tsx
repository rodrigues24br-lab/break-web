"use client"

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { ArrowRight, ArrowUp, RefreshCw, RotateCcw, Search, Sparkles, X } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import type { Locale } from "@/lib/i18n"
import { AFFILIATE_COPY } from "@/lib/affiliate-copy"
import { buildSearchIndex, prepareIndex, searchIndex, type SearchEntry } from "@/lib/affiliate-search"

const AGENT_UI: Record<
  Locale,
  {
    placeholder: string
    followUpPlaceholder: string
    label: string
    clear: string
    send: string
    intro: string
    suggestions: string[]
    thinking: string
    simpler: string
    simplerPrompt: string
    newQuestion: string
    seeSection: (section: string) => string
    error: string
    retry: string
    you: string
    assistant: string
  }
> = {
  pt: {
    placeholder: "Tem uma dúvida? Pergunte aqui",
    followUpPlaceholder: "Pergunte mais alguma coisa",
    label: "Pergunte sobre o programa de afiliados",
    clear: "Limpar",
    send: "Enviar pergunta",
    intro: "Pergunte o que quiser sobre o programa. Respondo em poucas palavras.",
    suggestions: [
      "Como funciona o plano de 50%?",
      "Qual a diferença entre o Plano A e o B?",
      "Quando eu recebo minha comissão?",
      "Quanto tempo dura o cookie?",
    ],
    thinking: "Pensando…",
    simpler: "Explica de outro jeito",
    simplerPrompt: "Não entendi direito. Pode explicar de outro jeito, mais simples?",
    newQuestion: "Nova pergunta",
    seeSection: (s) => `Ver “${s}” na página`,
    error: "Não consegui responder agora.",
    retry: "Tentar de novo",
    you: "Você",
    assistant: "Assistente Vemluz",
  },
  en: {
    placeholder: "Got a question? Ask here",
    followUpPlaceholder: "Ask something else",
    label: "Ask about the affiliate program",
    clear: "Clear",
    send: "Send question",
    intro: "Ask anything about the program. I keep answers short.",
    suggestions: [
      "How does the 50% plan work?",
      "What's the difference between Plan A and B?",
      "When do I get paid?",
      "How long does the cookie last?",
    ],
    thinking: "Thinking…",
    simpler: "Explain it another way",
    simplerPrompt: "I didn't quite get it. Can you explain it another way, more simply?",
    newQuestion: "New question",
    seeSection: (s) => `See “${s}” on the page`,
    error: "I couldn't answer right now.",
    retry: "Try again",
    you: "You",
    assistant: "Vemluz assistant",
  },
  es: {
    placeholder: "¿Tienes una duda? Pregunta aquí",
    followUpPlaceholder: "Pregunta algo más",
    label: "Pregunta sobre el programa de afiliados",
    clear: "Borrar",
    send: "Enviar pregunta",
    intro: "Pregunta lo que quieras sobre el programa. Respondo en pocas palabras.",
    suggestions: [
      "¿Cómo funciona el plan del 50%?",
      "¿Cuál es la diferencia entre el Plan A y el B?",
      "¿Cuándo recibo mi comisión?",
      "¿Cuánto dura la cookie?",
    ],
    thinking: "Pensando…",
    simpler: "Explícalo de otra forma",
    simplerPrompt: "No lo entendí bien. ¿Puedes explicarlo de otra forma, más simple?",
    newQuestion: "Nueva pregunta",
    seeSection: (s) => `Ver “${s}” en la página`,
    error: "No pude responder ahora.",
    retry: "Intentar de nuevo",
    you: "Tú",
    assistant: "Asistente Vemluz",
  },
}

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId)
  if (!target) return
  const top = target.getBoundingClientRect().top + window.scrollY - 88
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" })
}

function messageText(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")
}

export default function AffiliateSearch() {
  const { locale } = useLocale()
  const ui = AGENT_UI[locale]
  const index = useMemo(() => prepareIndex(buildSearchIndex(AFFILIATE_COPY[locale], locale)), [locale])

  const { messages, sendMessage, status, regenerate, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/affiliate-assistant" }),
  })

  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const busy = status === "submitted" || status === "streaming"
  const hasConversation = messages.length > 0
  const lastMessage = messages[messages.length - 1]
  const lastAnswerReady = status === "ready" && lastMessage?.role === "assistant"

  const relatedSection: SearchEntry | undefined = useMemo(() => {
    const lastQuestion = [...messages].reverse().find((m) => m.role === "user")
    if (!lastQuestion) return undefined
    return searchIndex(index, messageText(lastQuestion), 1)[0]
  }, [index, messages])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, status])

  function ask(text: string) {
    const question = text.trim()
    if (!question || busy) return
    setOpen(true)
    setInput("")
    sendMessage({ text: question }, { body: { locale } })
  }

  function reset() {
    stop()
    setMessages([])
    setInput("")
    inputRef.current?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (input) setInput("")
      else {
        setOpen(false)
        inputRef.current?.blur()
      }
      return
    }
    if (e.key === "Enter") {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      ask(input)
    }
  }

  return (
    <div className="flex-1 min-w-0 sm:relative">
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
      >
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          aria-label={ui.label}
          aria-expanded={open}
          aria-controls={panelId}
          autoComplete="off"
          enterKeyHint="send"
          maxLength={300}
          value={input}
          placeholder={hasConversation ? ui.followUpPlaceholder : ui.placeholder}
          onChange={(e) => {
            setInput(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="w-full h-10 rounded-full bg-card border border-border pl-10 pr-12 text-[14px] text-heading placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/60 focus:ring-4 focus:ring-primary/15"
        />
        {input.trim() ? (
          <button
            type="submit"
            aria-label={ui.send}
            disabled={busy}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 rounded-full flex items-center justify-center bg-primary text-primary-foreground transition-opacity disabled:opacity-50"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
        ) : (
          hasConversation && (
            <button
              type="button"
              aria-label={ui.newQuestion}
              onMouseDown={(e) => e.preventDefault()}
              onClick={reset}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-heading hover:bg-accent"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )
        )}
      </form>

      {open && (
        <div
          id={panelId}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-3 right-3 sm:left-0 sm:right-0 top-full mt-2 rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden"
        >
          {!hasConversation ? (
            <div className="p-4">
              <p className="flex items-center gap-2 text-[14px] text-muted-foreground">
                <Sparkles className="size-4 text-primary shrink-0" aria-hidden="true" />
                {ui.intro}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ui.suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => ask(s)}
                      className="rounded-full border border-border px-3 py-1.5 text-[13px] text-heading transition-colors hover:border-primary/50 hover:bg-accent"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="max-h-[min(60vh,460px)] overflow-y-auto p-4 flex flex-col gap-4"
                aria-live="polite"
              >
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="flex justify-end">
                      <p className="sr-only">{ui.you}:</p>
                      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-[14px] text-heading leading-relaxed">
                        {messageText(m)}
                      </p>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-3">
                      <span
                        className="mt-0.5 size-7 shrink-0 rounded-full bg-primary/15 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <Sparkles className="size-3.5 text-primary" />
                      </span>
                      <div className="min-w-0">
                        <p className="sr-only">{ui.assistant}:</p>
                        <p className="text-[15px] text-heading leading-relaxed text-pretty whitespace-pre-wrap">
                          {messageText(m)}
                        </p>
                      </div>
                    </div>
                  ),
                )}

                {status === "submitted" && (
                  <div className="flex gap-3 items-center">
                    <span
                      className="size-7 shrink-0 rounded-full bg-primary/15 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <Sparkles className="size-3.5 text-primary animate-pulse" />
                    </span>
                    <p className="text-[14px] text-muted-foreground">{ui.thinking}</p>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                    <p className="text-[14px] text-heading flex-1">{ui.error}</p>
                    <button
                      type="button"
                      onClick={() => regenerate({ body: { locale } })}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
                    >
                      <RefreshCw className="size-3.5" aria-hidden="true" />
                      {ui.retry}
                    </button>
                  </div>
                )}
              </div>

              {lastAnswerReady && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                  <button
                    type="button"
                    onClick={() => ask(ui.simplerPrompt)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] text-heading transition-colors hover:border-primary/50 hover:bg-accent"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    {ui.simpler}
                  </button>
                  {relatedSection && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        inputRef.current?.blur()
                        scrollToSection(relatedSection.sectionId)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-heading hover:bg-accent"
                    >
                      {ui.seeSection(relatedSection.section)}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={reset}
                    className="ml-auto text-[13px] text-muted-foreground hover:text-heading"
                  >
                    {ui.newQuestion}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
