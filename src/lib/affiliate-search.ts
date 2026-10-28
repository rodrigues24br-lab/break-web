import type { Locale } from "@/lib/i18n"
import { MARKET_DATA, formatMoney, type AffiliateCopy } from "@/lib/affiliate-copy"

export type SearchEntry = {
  id: string
  section: string
  sectionId: string
  title: string
  text: string
  keywords: string
}

export const SEARCH_UI: Record<
  Locale,
  {
    placeholder: string
    label: string
    clear: string
    empty: (query: string) => string
    emptyHint: string
    results: (n: number) => string
    goTo: string
  }
> = {
  pt: {
    placeholder: "Tem uma dúvida? Pergunte aqui",
    label: "Buscar respostas nesta página",
    clear: "Limpar busca",
    empty: (q) => `Nenhuma resposta para “${q}”.`,
    emptyHint: "Tente palavras como comissão, cookie, pagamento, vídeo ou Canadá.",
    results: (n) => `${n} ${n === 1 ? "resposta" : "respostas"}`,
    goTo: "Ver na página",
  },
  en: {
    placeholder: "Got a question? Ask here",
    label: "Search answers on this page",
    clear: "Clear search",
    empty: (q) => `No answers for “${q}”.`,
    emptyHint: "Try words like commission, cookie, payout, video or Canada.",
    results: (n) => `${n} ${n === 1 ? "answer" : "answers"}`,
    goTo: "See on page",
  },
  es: {
    placeholder: "¿Tienes una duda? Pregunta aquí",
    label: "Buscar respuestas en esta página",
    clear: "Borrar búsqueda",
    empty: (q) => `No hay respuestas para “${q}”.`,
    emptyHint: "Prueba palabras como comisión, cookie, pago, video o Canadá.",
    results: (n) => `${n} ${n === 1 ? "respuesta" : "respuestas"}`,
    goTo: "Ver en la página",
  },
}

const KEYWORDS: Record<Locale, Record<string, string>> = {
  pt: {
    "plan-a": "plano a link divulgar sem video 30 porcento comissao",
    "plan-b": "plano b video gravar reels stories 50 porcento prova social",
    lifetime: "vitalicia renovacao recorrente sempre anual",
    cookie: "cookie 90 dias atribuicao clique prazo",
    payout: "pagamento pago receber quando prazo dinheiro mes saque",
    fixed: "fixo valor fixo pagamento video",
    price: "preco valor quanto custa assinatura cupom desconto stripe",
    iphone: "android iphone ios brasil pais",
    projections: "ganhar ganho quanto renda mes projecao",
    canada: "canada cad dolar canadense eua estados unidos",
  },
  en: {
    "plan-a": "plan a link promote no video 30 percent commission",
    "plan-b": "plan b video record reels stories 50 percent social proof",
    lifetime: "lifetime renewal recurring forever annual",
    cookie: "cookie 90 days attribution click window",
    payout: "payout paid payment when get money month",
    fixed: "fixed flat fee payment video",
    price: "price cost how much subscription coupon discount stripe",
    iphone: "android iphone ios country",
    projections: "earn earnings income how much month projection",
    canada: "canada cad canadian dollar us united states",
  },
  es: {
    "plan-a": "plan a enlace link promocionar sin video 30 por ciento comision",
    "plan-b": "plan b video grabar reels stories 50 por ciento prueba social",
    lifetime: "vitalicia renovacion recurrente siempre anual",
    cookie: "cookie 90 dias atribucion clic plazo",
    payout: "pago pagado cobrar recibir cuando dinero mes",
    fixed: "fijo valor fijo pago video",
    price: "precio cuanto cuesta suscripcion cupon descuento stripe",
    iphone: "android iphone ios pais",
    projections: "ganar ganancia ingresos cuanto mes proyeccion",
    canada: "canada cad dolar canadiense eeuu estados unidos",
  },
}

const STOPWORDS = new Set(
  (
    "o a os as de do da dos das e em um uma para pra por com que como e no na nos nas meu minha eu se ao " +
    "the an is are of to in and for my i do does how what can it on or " +
    "el la los las del y en un una para por con que como es mi yo se al lo"
  ).split(" "),
)

export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function buildSearchIndex(t: AffiliateCopy, locale: Locale): SearchEntry[] {
  const kw = KEYWORDS[locale]
  const money = (market: "us" | "ca", value: number) => formatMoney(locale, market, value)
  const entry = (id: string, sectionId: string, section: string, title: string, text: string): SearchEntry => ({
    id,
    sectionId,
    section,
    title,
    text,
    keywords: kw[id] ?? "",
  })

  return [
    entry(
      "plan-a",
      "plans",
      t.plans.eyebrow,
      `${t.plans.planA} · ${t.plans.noVideo}`,
      `${t.plans.summaryA} ${t.plans.average(money("us", MARKET_DATA.us.planA))} 🇺🇸 · ${t.plans.average(money("ca", MARKET_DATA.ca.planA))} 🇨🇦`,
    ),
    entry(
      "plan-b",
      "plans",
      t.plans.eyebrow,
      `${t.plans.planB} · ${t.plans.withVideo}`,
      `${t.plans.summaryB} ${t.plans.average(money("us", MARKET_DATA.us.planB))} 🇺🇸 · ${t.plans.average(money("ca", MARKET_DATA.ca.planB))} 🇨🇦`,
    ),
    entry("plans-choose", "plans", t.plans.eyebrow, t.plans.chooseStrong, t.plans.chooseText.trim()),
    entry("lifetime", "commissions", t.commissions.eyebrow, t.commissions.lifetimeTitle, t.commissions.lifetimeText),
    entry("cookie", "commissions", t.commissions.eyebrow, t.commissions.cookieTitle, t.commissions.cookieText),
    entry("payout", "commissions", t.commissions.eyebrow, t.commissions.payoutTitle, t.commissions.payoutText),
    entry("fixed", "commissions", t.commissions.eyebrow, t.commissions.fixedTitle, t.commissions.fixedText),
    entry("commissions-base", "commissions", t.commissions.eyebrow, t.commissions.title, t.commissions.body),
    entry("what-is", "what-is", t.whatIs.eyebrow, t.whatIs.title, `${t.whatIs.body} ${t.whatIs.facts.map((f) => f.text).join(" ")}`),
    entry("honest", "what-is", t.whatIs.eyebrow, t.whatIs.honestStrong.replace(/:$/, ""), t.whatIs.honestText),
    entry(
      "product",
      "sold",
      t.sold.eyebrow,
      t.sold.title,
      `${t.sold.body} ${t.sold.planLabel}: ${money("us", MARKET_DATA.us.price)}${t.sold.perYear} 🇺🇸 · ${money("ca", MARKET_DATA.ca.price)}${t.sold.perYear} 🇨🇦. ${t.sold.features.join(". ")}.`,
    ),
    entry("price", "sold", t.sold.eyebrow, t.sold.priceTitle, t.sold.priceText),
    entry("iphone", "sold", t.sold.eyebrow, t.sold.iphoneTitle, t.sold.iphoneText),
    entry("canada", "sold", t.sold.eyebrow, t.market.labels.ca, `${t.market.notes.us} ${t.market.notes.ca}`),
    entry(
      "sale",
      "how-sale",
      t.sale.eyebrow,
      t.sale.title,
      `${t.sale.steps.map((s) => `${s.title}: ${s.text}`).join(" ")} ${t.sale.calloutStrong}${t.sale.calloutEnd}`,
    ),
    ...t.promote.items.map((item, i) =>
      entry(`promote-${i}`, "promote", t.promote.eyebrow, item.title, item.text),
    ),
    entry("projections", "projections", t.projections.eyebrow, t.projections.title, `${t.projections.body} ${t.projections.warnText}${t.projections.warnStrong}`),
    ...t.firstSteps.steps.map((step, i) =>
      entry(`first-${i}`, "first-steps", t.firstSteps.eyebrow, step.title, step.text),
    ),
    ...t.faq.items.map((item, i) => entry(`faq-${i}`, "faq", t.faq.eyebrow, item.q, item.a)),
  ]
}

type Prepared = SearchEntry & { nTitle: string; nAll: string; words: string[] }

export function prepareIndex(entries: SearchEntry[]): Prepared[] {
  return entries.map((e) => {
    const nTitle = normalize(e.title)
    const nAll = normalize(`${e.title} ${e.text} ${e.keywords}`)
    return { ...e, nTitle, nAll, words: nAll.split(" ") }
  })
}

export function searchIndex(index: Prepared[], query: string, limit = 6): SearchEntry[] {
  const nQuery = normalize(query)
  if (!nQuery) return []
  const all = nQuery.split(" ")
  const filtered = all.filter((tok) => !STOPWORDS.has(tok))
  const tokens = filtered.length ? filtered : all

  const scored = index
    .map((e) => {
      let score = 0
      let matched = 0
      for (const tok of tokens) {
        const stem = tok.length >= 5 ? tok.slice(0, tok.length - 1) : tok
        const hit = e.words.some((w) => w.startsWith(stem) || (tok.length >= 4 && w.includes(tok)))
        if (!hit) continue
        matched++
        score += e.nTitle.split(" ").some((w) => w.startsWith(tok)) ? 3 : 1
      }
      if (tokens.length > 1 && e.nAll.includes(nQuery)) score += 4
      return { e, score, matched }
    })
    .filter((r) => r.matched > 0 && r.matched >= Math.ceil(tokens.length / 2))
    .sort((a, b) => b.matched - a.matched || b.score - a.score)

  const best = scored[0]?.matched ?? 0
  return scored
    .filter((r) => r.matched === best || best === 1)
    .slice(0, limit)
    .map((r) => r.e)
}
