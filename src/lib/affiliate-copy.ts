import type { Locale } from "@/lib/i18n"

export type Market = "us" | "ca"

type Item = { emoji: string; title: string; text: string }

export const MARKET_DATA: Record<
  Market,
  { flag: string; currency: string; price: number; planA: number; planB: number }
> = {
  us: { flag: "🇺🇸", currency: "US$", price: 49.99, planA: 15, planB: 25 },
  ca: { flag: "🇨🇦", currency: "CAD$", price: 69.99, planA: 21, planB: 35 },
}

export const PROJECTION_SALES_PER_DAY = [1, 3, 5, 10, 20]

const NUMBER_LOCALE: Record<Locale, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" }

export function formatMoney(locale: Locale, market: Market, value: number) {
  const formatted = new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
  return `${MARKET_DATA[market].currency} ${formatted}`
}

export type AffiliateCopy = {
  meta: { title: string; description: string }
  header: { badge: string }
  hero: {
    eyebrow: string
    title: string
    body: string
    chips: string[]
    calloutStrong: string
    calloutText: string
    imageAlt: string
  }
  whatIs: {
    eyebrow: string
    title: string
    body: string
    facts: Item[]
    honestStrong: string
    honestText: string
  }
  market: {
    labels: Record<Market, string>
    intro: string
    aria: string
    notes: Record<Market, string>
  }
  sold: {
    eyebrow: string
    title: string
    body: string
    planLabel: string
    perYear: string
    features: string[]
    priceTitle: string
    priceText: string
    competitor: string
    bars: string[]
    iphoneTitle: string
    iphoneText: string
    iphoneChip: string
    androidChip: string
  }
  sale: {
    eyebrow: string
    title: string
    steps: Item[]
    calloutText: string
    calloutStrong: string
    calloutEnd: string
  }
  plans: {
    eyebrow: string
    title: string
    body: string
    noVideo: string
    withVideo: string
    highest: string
    planA: string
    planB: string
    summaryA: string
    summaryB: string
    perSale: string
    average: (value: string) => string
    stepsTitle: string
    step: (n: number) => string
    stepsA: string[]
    stepsB: string[]
    chooseStrong: string
    chooseText: string
  }
  promote: { eyebrow: string; title: string; items: Item[] }
  commissions: {
    eyebrow: string
    title: string
    body: string
    lifetimeTitle: string
    lifetimeText: string
    years: string[]
    cookieTitle: string
    cookieText: string
    timeline: { day: string; text: string; valid: boolean }[]
    payoutTitle: string
    payoutText: string
    fixedTitle: string
    fixedText: string
  }
  projections: {
    eyebrow: string
    title: string
    body: string
    caption: (market: string) => string
    salesPerDay: string
    sales: (n: number) => string
    perMonth: string
    warnText: string
    warnStrong: string
  }
  firstSteps: { eyebrow: string; title: string; steps: Item[] }
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] }
  closing: { title: string; text: string }
  footer: { rights: string }
}

const pt: AffiliateCopy = {
  meta: {
    title: "Programa de Parceiros Vemluz",
    description:
      "Entenda como funciona o programa de parceiros Vemluz: dois planos, comissão vitalícia de 30% ou 50%, cookie de 90 dias e projeções de ganho.",
  },
  header: { badge: "🤝 Programa de parceiros" },
  hero: {
    eyebrow: "🤝 Programa de parceiros Vemluz",
    title: "Indique o Vemluz e ganhe em cada venda, para sempre",
    body: "Tudo o que você precisa saber sobre a parceria está nesta página: o produto, os dois planos, como a comissão funciona e projeções de ganho.",
    chips: ["💸 30% ou 50% por venda", "♾️ Comissão vitalícia", "🍪 Cookie de 90 dias", "🇺🇸 🇨🇦 EUA e Canadá"],
    calloutStrong: "Página só informativa.",
    calloutText: "Leia com calma e, depois, volte para o nosso DM no Instagram para conversarmos.",
    imageAlt: "Ilustração de um iPhone com ampulheta e cadeado, cercado por moedas e um link de parceiro",
  },
  whatIs: {
    eyebrow: "O produto",
    title: "O que é o Vemluz",
    body: "O Vemluz é um app americano, nascido nos Estados Unidos, que ajuda as pessoas a recuperar o tempo perdido nas redes sociais.",
    facts: [
      { emoji: "📱", title: "Escolha os apps", text: "Você escolhe os apps que mais prendem, como Instagram e TikTok." },
      { emoji: "⏱️", title: "Defina um limite", text: "Configura um limite diário de uso para cada um." },
      { emoji: "🔒", title: "O app bloqueia", text: "Quando o tempo acaba, o Vemluz bloqueia o acesso." },
    ],
    honestStrong: "Sendo honesto:",
    honestText:
      "o app foi lançado há cerca de um mês e as campanhas de venda estão começando agora. Não prometemos resultados que ainda não existem.",
  },
  market: {
    labels: { us: "Estados Unidos", ca: "Canadá" },
    intro: "🌎 A página atende dois mercados. ",
    aria: "Mercado",
    notes: {
      us: "Valores em dólares americanos, para clientes dos Estados Unidos.",
      ca: "Valores em dólares canadenses, para clientes do Canadá.",
    },
  },
  sold: {
    eyebrow: "O que é vendido",
    title: "Seus seguidores compram o próprio app",
    body: "O produto é o Vemluz no plano Pro Anual, comprado pelo seu link de parceiro.",
    planLabel: "Pro Anual",
    perYear: "/ano",
    features: ["Pagamento pela Stripe, no site", "Renovação anual automática", "7 dias grátis para testar"],
    priceTitle: "Preço que já é argumento",
    priceText:
      "Sem cupom de desconto para seguidores. Concorrentes começam em US$ 60, alguns em US$ 100. O Vemluz custa US$ 49,99.",
    competitor: "Concorrente",
    bars: ["US$ 100", "US$ 60", "US$ 49,99"],
    iphoneTitle: "Só iPhone, por enquanto",
    iphoneText:
      "Hoje o Vemluz funciona apenas no iPhone. A versão para Android já está em produção. O foco imediato é Estados Unidos e Canadá.",
    iphoneChip: "✅ iPhone",
    androidChip: "🛠️ Android em produção",
  },
  sale: {
    eyebrow: "Como a venda funciona",
    title: "Do seu link à comissão, em quatro passos",
    steps: [
      { emoji: "🔗", title: "Você recebe seu link", text: "Cada parceiro ganha um link exclusivo de parceiro." },
      { emoji: "🗣️", title: "Você fala do seu dia a dia", text: "Conta como usa os apps no dia a dia e compartilha o link." },
      { emoji: "🛒", title: "O seguidor compra", text: "Clica no link e assina o Pro Anual direto no site." },
      { emoji: "♾️", title: "Comissão vitalícia", text: "Cada compra pelo link paga comissão, e cada renovação anual paga de novo." },
    ],
    calloutText: "O Vemluz cuida da venda, do suporte e do acompanhamento do cliente. ",
    calloutStrong: "Seu único trabalho:",
    calloutEnd: " trazer o cliente pelo link.",
  },
  plans: {
    eyebrow: "Os dois planos",
    title: "Dois jeitos de ser parceiro",
    body: "A base é a mesma nos dois: você recebe um link, usa esse link e cada compra feita por ele gera comissão vitalícia.",
    noVideo: "Sem vídeo",
    withVideo: "Com vídeo",
    highest: "Maior comissão",
    planA: "Plano A",
    planB: "Plano B",
    summaryA: "Você divulga com seu link e ganha 30% de comissão vitalícia em cada venda.",
    summaryB:
      "Você grava um vídeo do seu uso diário do app, autoriza a Vemluz a postar nos Reels e Stories como prova social, e ganha 50% de comissão vitalícia.",
    perSale: "por venda",
    average: (value) => `≈ ${value} em média por venda`,
    stepsTitle: "Passo a passo",
    step: (n) => `Passo ${n}`,
    stepsA: ["Você fala do Vemluz nas suas redes", "Compartilha seu link", "Ganha 30% em cada venda"],
    stepsB: [
      "Você grava um vídeo falando da sua experiência real com o app",
      "Manda o vídeo pra Vemluz",
      "A gente posta nos Reels e Stories como prova social",
      "Você ganha 50% em cada venda",
    ],
    chooseStrong: "Qual plano escolher?",
    chooseText: " Só o que fizer sentido para você e para o seu público, sem pressão. Qual dos dois te interessa mais?",
  },
  promote: {
    eyebrow: "Divulgação",
    title: "Como o parceiro divulga",
    items: [
      { emoji: "📱", title: "Uso real nas suas redes", text: "Posts, Reels e Stories falando de como você usa os apps no dia a dia." },
      { emoji: "🔗", title: "Compartilhe seu link", text: "O link é o que registra a venda como sua." },
      {
        emoji: "🎥",
        title: "Plano B: vídeo de uso",
        text: "Grave um vídeo normal usando o app e envie para o Vemluz postar no Instagram, só em Reels e Stories, como prova social. Nunca em anúncios.",
      },
      { emoji: "🧪", title: "Teste antes de divulgar", text: "Use o app por 2 a 3 dias no seu dia a dia para falar com experiência real." },
      { emoji: "🙅", title: "Nunca invente resultados", text: "Ganhos sempre como projeção condicional, nunca como resultado que já existe." },
    ],
  },
  commissions: {
    eyebrow: "Comissões",
    title: "Como as comissões funcionam",
    body: "A comissão é paga em cada venda feita pelo seu link. Sem venda, sem comissão.",
    lifetimeTitle: "Comissão vitalícia",
    lifetimeText:
      "Você recebe na venda inicial e de novo em cada renovação anual, enquanto o cliente continuar renovando. Se alguém que você indicou fica um ano e renova, você ganha sobre a compra original e sobre a renovação.",
    years: ["Venda inicial", "Renovação ano 2", "Renovação ano 3", "E assim por diante"],
    cookieTitle: "Cookie de 90 dias",
    cookieText:
      "Se alguém clica no seu link hoje e só compra 15 dias depois, ou até 89 dias depois, a venda continua sendo sua e a comissão vale. A atribuição só expira depois de 90 dias sem compra.",
    timeline: [
      { day: "Dia 0", text: "Clique no seu link", valid: true },
      { day: "Dia 15", text: "Compra: venda sua", valid: true },
      { day: "Dia 89", text: "Compra: ainda sua", valid: true },
      { day: "Dia 90+", text: "Atribuição expira", valid: false },
    ],
    payoutTitle: "Quando a comissão é paga",
    payoutText:
      "As comissões são pagas sete dias após o fim de cada mês, na plataforma de afiliados. Estamos trabalhando para reduzir esse prazo para no máximo quinze dias a partir do primeiro pagamento do cliente.",
    fixedTitle: "Sem pagamento fixo",
    fixedText:
      "Não existe valor fixo pelo vídeo do Plano B. O vídeo é a condição para a comissão maior, não uma compra de vídeo.",
  },
  projections: {
    eyebrow: "Projeções, não promessas",
    title: "Quanto você pode ganhar por mês",
    body: "Projeção condicional: se você mantiver uma média diária de vendas, este é o ganho mensal aproximado (média de 30 dias).",
    caption: (market) => `Projeção de ganho mensal por vendas diárias, em ${market}`,
    salesPerDay: "🛒 Vendas por dia",
    sales: (n) => `${n} ${n === 1 ? "venda" : "vendas"}`,
    perMonth: "/mês",
    warnText: "A projeção depende das vendas reais feitas pelo seu link. ",
    warnStrong: "Não é garantia.",
  },
  firstSteps: {
    eyebrow: "Primeiros passos",
    title: "Como começar",
    steps: [
      { emoji: "🎯", title: "Escolha um plano", text: "Plano A ou Plano B, o que fizer sentido para você." },
      {
        emoji: "📲",
        title: "Use o app por 2 a 3 dias",
        text: "O plano pago tem 7 dias grátis. Para não ser cobrado, cancele em até 4 dias no painel de assinaturas da Apple.",
      },
      { emoji: "📝", title: "Contrato e cadastro", text: "Você se cadastra na plataforma de afiliados e recebe seu link de parceiro." },
      { emoji: "🚀", title: "Comece a divulgar", text: "Fale do seu uso real e compartilhe o link." },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    title: "Perguntas que parceiros já fizeram",
    items: [
      { q: "Quais são os detalhes e os valores?", a: "São os dois planos descritos nesta página, com valores, a condição do vídeo no Plano B e as projeções." },
      { q: "Tem cupom de desconto para os seguidores?", a: "Não. O preço de entrada (US$ 49,99) já está abaixo dos concorrentes, que começam em US$ 60." },
      { q: "O que meus seguidores vão comprar?", a: "O próprio app Vemluz, plano Pro Anual, pelo seu link." },
      { q: "Como o app funciona?", a: "A pessoa escolhe os apps que mais prendem, define um limite diário e, quando o tempo acaba, o app bloqueia o acesso." },
      { q: "O vídeo do Plano B vai para anúncios?", a: "Não. Ele vai só para os Reels e Stories do nosso Instagram, como prova social. Não vamos usar em campanhas pagas." },
      { q: "Preciso gravar vídeo no Plano A?", a: "Não. O Plano A é divulgação só com o link. O vídeo é condição apenas do Plano B." },
      { q: "Funciona no Android? E no Brasil?", a: "Por enquanto, só no iPhone. A versão Android está em produção. O foco imediato é Estados Unidos e Canadá." },
      { q: "De onde é o app?", a: "Americano, nascido nos Estados Unidos, com produto global. A equipe está se conectando com o público brasileiro nos EUA." },
      { q: "E se eu não vender nada?", a: "A comissão só existe sobre vendas feitas pelo link. Não há pagamento fixo." },
      { q: "Quem dá suporte ao cliente?", a: "O Vemluz. O parceiro só traz o cliente pelo link." },
      { q: "O app é novo?", a: "Sim, foi lançado há cerca de um mês e as campanhas estão começando. Não inventamos prova social." },
    ],
  },
  closing: {
    title: "Leu tudo? Vamos conversar no DM",
    text: "Volte para a nossa conversa no Instagram e conte qual plano te interessa mais. Respondemos qualquer dúvida por lá.",
  },
  footer: { rights: "Todos os direitos reservados." },
}

const en: AffiliateCopy = {
  meta: {
    title: "Vemluz Partner Program",
    description:
      "Learn how the Vemluz partner program works: two plans, 30% or 50% lifetime commission, a 90-day cookie and earnings projections.",
  },
  header: { badge: "🤝 Partner program" },
  hero: {
    eyebrow: "🤝 Vemluz partner program",
    title: "Refer Vemluz and earn on every sale, for life",
    body: "Everything you need to know about the partnership is on this page: the product, the two plans, how commission works and earnings projections.",
    chips: ["💸 30% or 50% per sale", "♾️ Lifetime commission", "🍪 90-day cookie", "🇺🇸 🇨🇦 US and Canada"],
    calloutStrong: "Informational page only.",
    calloutText: "Take your time reading it, then come back to our Instagram DM so we can talk.",
    imageAlt: "Illustration of an iPhone with an hourglass and a padlock, surrounded by coins and a partner link",
  },
  whatIs: {
    eyebrow: "The product",
    title: "What Vemluz is",
    body: "Vemluz is an American app, born in the United States, that helps people win back the time they lose on social media.",
    facts: [
      { emoji: "📱", title: "Pick the apps", text: "You choose the apps that hook you the most, like Instagram and TikTok." },
      { emoji: "⏱️", title: "Set a limit", text: "You set a daily usage limit for each one." },
      { emoji: "🔒", title: "The app blocks", text: "When time is up, Vemluz blocks access." },
    ],
    honestStrong: "To be honest:",
    honestText:
      "the app launched about a month ago and sales campaigns are just starting. We don't promise results that don't exist yet.",
  },
  market: {
    labels: { us: "United States", ca: "Canada" },
    intro: "🌎 This page serves two markets. ",
    aria: "Market",
    notes: {
      us: "Prices in US dollars, for customers in the United States.",
      ca: "Prices in Canadian dollars, for customers in Canada.",
    },
  },
  sold: {
    eyebrow: "What is sold",
    title: "Your followers buy the app itself",
    body: "The product is Vemluz on the Pro Annual plan, purchased through your partner link.",
    planLabel: "Pro Annual",
    perYear: "/year",
    features: ["Paid via Stripe, on the website", "Automatic annual renewal", "7-day free trial"],
    priceTitle: "A price that sells itself",
    priceText:
      "No discount coupons for followers. Competitors start at US$ 60, some at US$ 100. Vemluz costs US$ 49.99.",
    competitor: "Competitor",
    bars: ["US$ 100", "US$ 60", "US$ 49.99"],
    iphoneTitle: "iPhone only, for now",
    iphoneText:
      "Today Vemluz works only on iPhone. The Android version is already in development. The immediate focus is the United States and Canada.",
    iphoneChip: "✅ iPhone",
    androidChip: "🛠️ Android in development",
  },
  sale: {
    eyebrow: "How a sale works",
    title: "From your link to your commission, in four steps",
    steps: [
      { emoji: "🔗", title: "You get your link", text: "Every partner gets an exclusive partner link." },
      { emoji: "🗣️", title: "You share your day to day", text: "Talk about how you use the apps every day and share the link." },
      { emoji: "🛒", title: "Your follower buys", text: "They click the link and subscribe to Pro Annual right on the website." },
      { emoji: "♾️", title: "Lifetime commission", text: "Every purchase through the link pays commission, and every annual renewal pays again." },
    ],
    calloutText: "Vemluz handles the sale, support and customer follow-up. ",
    calloutStrong: "Your only job:",
    calloutEnd: " bring the customer through your link.",
  },
  plans: {
    eyebrow: "The two plans",
    title: "Two ways to be a partner",
    body: "The basics are the same in both: you get a link, you use it, and every purchase made through it earns lifetime commission.",
    noVideo: "No video",
    withVideo: "With video",
    highest: "Highest commission",
    planA: "Plan A",
    planB: "Plan B",
    summaryA: "You promote with your link and earn a 30% lifetime commission on every sale.",
    summaryB:
      "You record a video of your daily use of the app, authorize Vemluz to post it on Reels and Stories as social proof, and earn a 50% lifetime commission.",
    perSale: "per sale",
    average: (value) => `≈ ${value} average per sale`,
    stepsTitle: "Step by step",
    step: (n) => `Step ${n}`,
    stepsA: ["You talk about Vemluz on your social media", "You share your link", "You earn 30% on every sale"],
    stepsB: [
      "You record a video about your real experience with the app",
      "You send the video to Vemluz",
      "We post it on Reels and Stories as social proof",
      "You earn 50% on every sale",
    ],
    chooseStrong: "Which plan should you choose?",
    chooseText: " Whatever makes sense for you and your audience, no pressure. Which one interests you more?",
  },
  promote: {
    eyebrow: "Promotion",
    title: "How partners promote",
    items: [
      { emoji: "📱", title: "Real use on your social media", text: "Posts, Reels and Stories about how you use the apps every day." },
      { emoji: "🔗", title: "Share your link", text: "The link is what records the sale as yours." },
      {
        emoji: "🎥",
        title: "Plan B: usage video",
        text: "Record a regular video using the app and send it to Vemluz to post on Instagram, only on Reels and Stories, as social proof. Never in ads.",
      },
      { emoji: "🧪", title: "Try it before promoting", text: "Use the app for 2 to 3 days in your routine so you can speak from real experience." },
      { emoji: "🙅", title: "Never make up results", text: "Always present earnings as a conditional projection, never as a result that already exists." },
    ],
  },
  commissions: {
    eyebrow: "Commissions",
    title: "How commissions work",
    body: "Commission is paid on every sale made through your link. No sale, no commission.",
    lifetimeTitle: "Lifetime commission",
    lifetimeText:
      "You earn on the initial sale and again on every annual renewal, for as long as the customer keeps renewing. If someone you referred stays for a year and renews, you earn on both the original purchase and the renewal.",
    years: ["Initial sale", "Year 2 renewal", "Year 3 renewal", "And so on"],
    cookieTitle: "90-day cookie",
    cookieText:
      "If someone clicks your link today and only buys 15 days later, or even 89 days later, the sale is still yours and the commission is valid. Attribution only expires after 90 days without a purchase.",
    timeline: [
      { day: "Day 0", text: "Click on your link", valid: true },
      { day: "Day 15", text: "Purchase: your sale", valid: true },
      { day: "Day 89", text: "Purchase: still yours", valid: true },
      { day: "Day 90+", text: "Attribution expires", valid: false },
    ],
    payoutTitle: "When commission is paid",
    payoutText:
      "Commissions are paid seven days after the end of each calendar month on the affiliate platform. We are working to reduce this to a maximum of fifteen days from the customer's first payment.",
    fixedTitle: "No fixed payment",
    fixedText:
      "There is no fixed fee for the Plan B video. The video is the condition for the higher commission, not a video purchase.",
  },
  projections: {
    eyebrow: "Projections, not promises",
    title: "How much you could earn per month",
    body: "Conditional projection: if you keep a daily sales average, this is the approximate monthly earning (30-day average).",
    caption: (market) => `Monthly earnings projection by daily sales, in ${market}`,
    salesPerDay: "🛒 Sales per day",
    sales: (n) => `${n} ${n === 1 ? "sale" : "sales"}`,
    perMonth: "/mo",
    warnText: "The projection depends on the real sales made through your link. ",
    warnStrong: "It is not a guarantee.",
  },
  firstSteps: {
    eyebrow: "First steps",
    title: "How to get started",
    steps: [
      { emoji: "🎯", title: "Pick a plan", text: "Plan A or Plan B, whichever makes sense for you." },
      {
        emoji: "📲",
        title: "Use the app for 2 to 3 days",
        text: "The paid plan has a 7-day free trial. To avoid being charged, cancel within 4 days in your Apple subscriptions settings.",
      },
      { emoji: "📝", title: "Agreement and sign-up", text: "You sign up on the affiliate platform and get your partner link." },
      { emoji: "🚀", title: "Start promoting", text: "Talk about your real use and share the link." },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions partners have asked",
    items: [
      { q: "What are the details and amounts?", a: "They are the two plans described on this page, with amounts, the Plan B video condition and the projections." },
      { q: "Is there a discount coupon for followers?", a: "No. The entry price (US$ 49.99) is already below competitors, which start at US$ 60." },
      { q: "What will my followers buy?", a: "The Vemluz app itself, Pro Annual plan, through your link." },
      { q: "How does the app work?", a: "People pick the apps that hook them most, set a daily limit and, when time is up, the app blocks access." },
      { q: "Will the Plan B video be used in ads?", a: "No. It only goes on our Instagram Reels and Stories, as social proof. We won't use it in paid campaigns." },
      { q: "Do I need to record a video for Plan A?", a: "No. Plan A is promotion with the link only. The video is a condition of Plan B only." },
      { q: "Does it work on Android? And in Brazil?", a: "For now, iPhone only. The Android version is in development. The immediate focus is the United States and Canada." },
      { q: "Where is the app from?", a: "American, born in the United States, with a global product. The team is connecting with the Brazilian audience in the US." },
      { q: "What if I don't sell anything?", a: "Commission only exists on sales made through the link. There is no fixed payment." },
      { q: "Who provides customer support?", a: "Vemluz. The partner only brings the customer through the link." },
      { q: "Is the app new?", a: "Yes, it launched about a month ago and campaigns are starting. We don't make up social proof." },
    ],
  },
  closing: {
    title: "Read everything? Let's talk in the DM",
    text: "Head back to our Instagram conversation and tell us which plan interests you most. We'll answer any questions there.",
  },
  footer: { rights: "All rights reserved." },
}

const es: AffiliateCopy = {
  meta: {
    title: "Programa de Socios Vemluz",
    description:
      "Entiende cómo funciona el programa de socios Vemluz: dos planes, comisión vitalicia del 30% o 50%, cookie de 90 días y proyecciones de ganancias.",
  },
  header: { badge: "🤝 Programa de socios" },
  hero: {
    eyebrow: "🤝 Programa de socios Vemluz",
    title: "Recomienda Vemluz y gana en cada venta, para siempre",
    body: "Todo lo que necesitas saber sobre la alianza está en esta página: el producto, los dos planes, cómo funciona la comisión y proyecciones de ganancias.",
    chips: ["💸 30% o 50% por venta", "♾️ Comisión vitalicia", "🍪 Cookie de 90 días", "🇺🇸 🇨🇦 EE. UU. y Canadá"],
    calloutStrong: "Página solo informativa.",
    calloutText: "Léela con calma y luego vuelve a nuestro DM en Instagram para conversar.",
    imageAlt: "Ilustración de un iPhone con un reloj de arena y un candado, rodeado de monedas y un enlace de socio",
  },
  whatIs: {
    eyebrow: "El producto",
    title: "Qué es Vemluz",
    body: "Vemluz es una app estadounidense, nacida en Estados Unidos, que ayuda a las personas a recuperar el tiempo perdido en las redes sociales.",
    facts: [
      { emoji: "📱", title: "Elige las apps", text: "Eliges las apps que más te enganchan, como Instagram y TikTok." },
      { emoji: "⏱️", title: "Define un límite", text: "Configuras un límite diario de uso para cada una." },
      { emoji: "🔒", title: "La app bloquea", text: "Cuando se acaba el tiempo, Vemluz bloquea el acceso." },
    ],
    honestStrong: "Siendo honestos:",
    honestText:
      "la app se lanzó hace cerca de un mes y las campañas de venta están empezando ahora. No prometemos resultados que todavía no existen.",
  },
  market: {
    labels: { us: "Estados Unidos", ca: "Canadá" },
    intro: "🌎 La página atiende dos mercados. ",
    aria: "Mercado",
    notes: {
      us: "Valores en dólares estadounidenses, para clientes de Estados Unidos.",
      ca: "Valores en dólares canadienses, para clientes de Canadá.",
    },
  },
  sold: {
    eyebrow: "Qué se vende",
    title: "Tus seguidores compran la propia app",
    body: "El producto es Vemluz en el plan Pro Anual, comprado con tu enlace de socio.",
    planLabel: "Pro Anual",
    perYear: "/año",
    features: ["Pago con Stripe, en el sitio", "Renovación anual automática", "7 días gratis para probar"],
    priceTitle: "Un precio que ya es argumento",
    priceText:
      "Sin cupón de descuento para seguidores. La competencia empieza en US$ 60, algunas en US$ 100. Vemluz cuesta US$ 49,99.",
    competitor: "Competidor",
    bars: ["US$ 100", "US$ 60", "US$ 49,99"],
    iphoneTitle: "Solo iPhone, por ahora",
    iphoneText:
      "Hoy Vemluz funciona solo en iPhone. La versión para Android ya está en desarrollo. El foco inmediato es Estados Unidos y Canadá.",
    iphoneChip: "✅ iPhone",
    androidChip: "🛠️ Android en desarrollo",
  },
  sale: {
    eyebrow: "Cómo funciona la venta",
    title: "De tu enlace a tu comisión, en cuatro pasos",
    steps: [
      { emoji: "🔗", title: "Recibes tu enlace", text: "Cada socio recibe un enlace exclusivo de socio." },
      { emoji: "🗣️", title: "Hablas de tu día a día", text: "Cuentas cómo usas las apps en el día a día y compartes el enlace." },
      { emoji: "🛒", title: "Tu seguidor compra", text: "Hace clic en el enlace y se suscribe al Pro Anual directo en el sitio." },
      { emoji: "♾️", title: "Comisión vitalicia", text: "Cada compra con el enlace paga comisión, y cada renovación anual paga de nuevo." },
    ],
    calloutText: "Vemluz se encarga de la venta, el soporte y el seguimiento del cliente. ",
    calloutStrong: "Tu único trabajo:",
    calloutEnd: " traer al cliente con tu enlace.",
  },
  plans: {
    eyebrow: "Los dos planes",
    title: "Dos formas de ser socio",
    body: "La base es la misma en los dos: recibes un enlace, lo usas y cada compra hecha con él genera comisión vitalicia.",
    noVideo: "Sin video",
    withVideo: "Con video",
    highest: "Mayor comisión",
    planA: "Plan A",
    planB: "Plan B",
    summaryA: "Promocionas con tu enlace y ganas un 30% de comisión vitalicia en cada venta.",
    summaryB:
      "Grabas un video de tu uso diario de la app, autorizas a Vemluz a publicarlo en Reels y Stories como prueba social, y ganas un 50% de comisión vitalicia.",
    perSale: "por venta",
    average: (value) => `≈ ${value} de media por venta`,
    stepsTitle: "Paso a paso",
    step: (n) => `Paso ${n}`,
    stepsA: ["Hablas de Vemluz en tus redes", "Compartes tu enlace", "Ganas un 30% en cada venta"],
    stepsB: [
      "Grabas un video contando tu experiencia real con la app",
      "Envías el video a Vemluz",
      "Lo publicamos en Reels y Stories como prueba social",
      "Ganas un 50% en cada venta",
    ],
    chooseStrong: "¿Qué plan elegir?",
    chooseText: " El que tenga sentido para ti y para tu público, sin presión. ¿Cuál de los dos te interesa más?",
  },
  promote: {
    eyebrow: "Promoción",
    title: "Cómo promociona el socio",
    items: [
      { emoji: "📱", title: "Uso real en tus redes", text: "Posts, Reels y Stories contando cómo usas las apps en el día a día." },
      { emoji: "🔗", title: "Comparte tu enlace", text: "El enlace es lo que registra la venta como tuya." },
      {
        emoji: "🎥",
        title: "Plan B: video de uso",
        text: "Graba un video normal usando la app y envíalo a Vemluz para publicarlo en Instagram, solo en Reels y Stories, como prueba social. Nunca en anuncios.",
      },
      { emoji: "🧪", title: "Pruébala antes de promocionar", text: "Usa la app de 2 a 3 días en tu rutina para hablar con experiencia real." },
      { emoji: "🙅", title: "Nunca inventes resultados", text: "Presenta las ganancias siempre como proyección condicional, nunca como un resultado que ya existe." },
    ],
  },
  commissions: {
    eyebrow: "Comisiones",
    title: "Cómo funcionan las comisiones",
    body: "La comisión se paga en cada venta hecha con tu enlace. Sin venta, no hay comisión.",
    lifetimeTitle: "Comisión vitalicia",
    lifetimeText:
      "Cobras en la venta inicial y de nuevo en cada renovación anual, mientras el cliente siga renovando. Si alguien que recomendaste se queda un año y renueva, ganas sobre la compra original y sobre la renovación.",
    years: ["Venta inicial", "Renovación año 2", "Renovación año 3", "Y así sucesivamente"],
    cookieTitle: "Cookie de 90 días",
    cookieText:
      "Si alguien hace clic en tu enlace hoy y compra 15 días después, o incluso 89 días después, la venta sigue siendo tuya y la comisión vale. La atribución solo expira tras 90 días sin compra.",
    timeline: [
      { day: "Día 0", text: "Clic en tu enlace", valid: true },
      { day: "Día 15", text: "Compra: venta tuya", valid: true },
      { day: "Día 89", text: "Compra: sigue siendo tuya", valid: true },
      { day: "Día 90+", text: "La atribución expira", valid: false },
    ],
    payoutTitle: "Cuándo se paga la comisión",
    payoutText:
      "Las comisiones se pagan siete días después del fin de cada mes, en la plataforma de afiliados. Estamos trabajando para reducir este plazo a un máximo de quince días desde el primer pago del cliente.",
    fixedTitle: "Sin pago fijo",
    fixedText:
      "No hay un valor fijo por el video del Plan B. El video es la condición para la comisión mayor, no una compra de video.",
  },
  projections: {
    eyebrow: "Proyecciones, no promesas",
    title: "Cuánto puedes ganar al mes",
    body: "Proyección condicional: si mantienes una media diaria de ventas, esta es la ganancia mensual aproximada (media de 30 días).",
    caption: (market) => `Proyección de ganancia mensual por ventas diarias, en ${market}`,
    salesPerDay: "🛒 Ventas por día",
    sales: (n) => `${n} ${n === 1 ? "venta" : "ventas"}`,
    perMonth: "/mes",
    warnText: "La proyección depende de las ventas reales hechas con tu enlace. ",
    warnStrong: "No es una garantía.",
  },
  firstSteps: {
    eyebrow: "Primeros pasos",
    title: "Cómo empezar",
    steps: [
      { emoji: "🎯", title: "Elige un plan", text: "Plan A o Plan B, el que tenga sentido para ti." },
      {
        emoji: "📲",
        title: "Usa la app de 2 a 3 días",
        text: "El plan de pago tiene 7 días gratis. Para que no te cobren, cancela en un plazo de 4 días en el panel de suscripciones de Apple.",
      },
      { emoji: "📝", title: "Contrato y registro", text: "Te registras en la plataforma de afiliados y recibes tu enlace de socio." },
      { emoji: "🚀", title: "Empieza a promocionar", text: "Habla de tu uso real y comparte el enlace." },
    ],
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Preguntas que ya hicieron otros socios",
    items: [
      { q: "¿Cuáles son los detalles y los valores?", a: "Son los dos planes descritos en esta página, con valores, la condición del video en el Plan B y las proyecciones." },
      { q: "¿Hay cupón de descuento para los seguidores?", a: "No. El precio de entrada (US$ 49,99) ya está por debajo de la competencia, que empieza en US$ 60." },
      { q: "¿Qué van a comprar mis seguidores?", a: "La propia app Vemluz, plan Pro Anual, con tu enlace." },
      { q: "¿Cómo funciona la app?", a: "La persona elige las apps que más la enganchan, define un límite diario y, cuando se acaba el tiempo, la app bloquea el acceso." },
      { q: "¿El video del Plan B va a anuncios?", a: "No. Solo va a los Reels y Stories de nuestro Instagram, como prueba social. No lo usaremos en campañas pagadas." },
      { q: "¿Tengo que grabar video en el Plan A?", a: "No. El Plan A es promoción solo con el enlace. El video es condición únicamente del Plan B." },
      { q: "¿Funciona en Android? ¿Y en Brasil?", a: "Por ahora, solo en iPhone. La versión Android está en desarrollo. El foco inmediato es Estados Unidos y Canadá." },
      { q: "¿De dónde es la app?", a: "Estadounidense, nacida en Estados Unidos, con un producto global. El equipo se está conectando con el público brasileño en EE. UU." },
      { q: "¿Y si no vendo nada?", a: "La comisión solo existe sobre ventas hechas con el enlace. No hay pago fijo." },
      { q: "¿Quién da soporte al cliente?", a: "Vemluz. El socio solo trae al cliente con el enlace." },
      { q: "¿La app es nueva?", a: "Sí, se lanzó hace cerca de un mes y las campañas están empezando. No inventamos prueba social." },
    ],
  },
  closing: {
    title: "¿Lo leíste todo? Hablemos por DM",
    text: "Vuelve a nuestra conversación en Instagram y cuéntanos qué plan te interesa más. Respondemos cualquier duda allí.",
  },
  footer: { rights: "Todos los derechos reservados." },
}

export const AFFILIATE_COPY: Record<Locale, AffiliateCopy> = { pt, en, es }
