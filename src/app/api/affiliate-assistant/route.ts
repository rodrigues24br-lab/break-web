import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"
import type { Locale } from "@/lib/i18n"
import { AFFILIATE_COPY } from "@/lib/affiliate-copy"
import { buildSearchIndex } from "@/lib/affiliate-search"

export const maxDuration = 30

const MAX_MESSAGES = 12
const MAX_CHARS_PER_MESSAGE = 600

const LANGUAGE_NAME: Record<Locale, string> = {
  pt: "Brazilian Portuguese",
  en: "English",
  es: "Spanish",
}

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in AFFILIATE_COPY
}

function buildKnowledge(locale: Locale) {
  return buildSearchIndex(AFFILIATE_COPY[locale], locale)
    .map((entry) => `[${entry.section}] ${entry.title}: ${entry.text}`)
    .join("\n")
}

function buildInstructions(locale: Locale) {
  return `You are the friendly assistant on the Vemluz affiliate program page. You explain how the program works to people thinking about becoming partners.

How to answer:
- Answer in ${LANGUAGE_NAME[locale]}, unless the visitor clearly writes in another language; then answer in theirs.
- Keep it short: 1 to 3 sentences, in natural conversational language, like a person explaining to a friend. Say "você/you/tú" to the visitor and "a gente/we/nosotros" for Vemluz.
- Plain text only. No markdown, no lists, no headings, no emojis.
- Go straight to the answer. Do not start with "Great question" or repeat the question.
- When asked about a plan, say what the person does and what they get. Example for the 50% plan: "No plano de 50%, você grava um vídeo do seu uso diário do app, manda pra gente, a gente posta nos Reels e Stories como prova social, e você ganha 50% de comissão vitalícia em cada venda."
- If the visitor asks the same thing again, says they did not understand, or asks for it in other words, explain it in a different and simpler way than your previous answer: use shorter words and, if it helps, a concrete everyday example with numbers. Never repeat your previous wording.
- Use only the facts below. Never invent numbers, dates, rules or promises. If the answer is not in the facts, say briefly that this page does not cover it and suggest contacting support.
- If the question has nothing to do with the affiliate program, gently say you can only help with questions about the Vemluz affiliate program.

Facts from the page:
${buildKnowledge(locale)}`
}

export async function POST(req: Request) {
  let body: { messages?: unknown; locale?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  const locale: Locale = isLocale(body.locale) ? body.locale : "en"
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "Missing messages" }, { status: 400 })
  }

  const messages = (body.messages as UIMessage[])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && Array.isArray(m.parts))
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      ...m,
      parts: m.parts
        .filter((p) => p.type === "text")
        .map((p) => ({ ...p, text: (p as { text: string }).text.slice(0, MAX_CHARS_PER_MESSAGE) })),
    })) as UIMessage[]

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Invalid messages" }, { status: 400 })
  }

  const result = streamText({
    model: "google/gemini-3.5-flash",
    instructions: buildInstructions(locale),
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
