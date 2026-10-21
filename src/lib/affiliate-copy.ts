import { LOCALES, type Locale } from "@/lib/i18n"

export const AFFILIATE_SIGNUP_URL = "https://break-app-limit.getrewardful.com/signup"

export const AFFILIATE_LOCALES = LOCALES
export type AffiliateLocale = Locale

export function toAffiliateLocale(locale: Locale): AffiliateLocale {
  return locale
}

const pt = {
  metaTitle: "Programa de Afiliados Break",
  metaDescription: "Indique o Break e ganhe 30% de comissão recorrente em cada assinatura anual.",
  cta: "Quero ser afiliado",
  rights: "Todos os direitos reservados.",
  hero: {
    logoAlt: "Logo do Break",
    eyebrow: "Programa de afiliados",
    title: "Programa de Afiliados Break",
    subtitleStart: "Indique o Break e ganhe ",
    subtitleHighlight: "30% de comissão recorrente",
    subtitleEnd: " em cada assinatura anual. Enquanto o cliente renovar, você continua recebendo.",
    note: "Cadastro gratuito. Leva menos de um minuto.",
  },
  commission: {
    eyebrow: "Comissão",
    title: "30% em cada assinatura, todo ano",
    body: "A comissão não é paga uma vez só. Cada assinatura anual que você indicar gera 30% do valor na primeira compra e de novo em cada renovação, enquanto o cliente continuar assinando.",
    badge: "Recorrente",
    per: "por assinatura anual",
    paid: "Pago na compra e em cada renovação",
    perks: [
      "30% de comissão recorrente em cada assinatura anual",
      "Rastreamento automático por link e cookie",
      "Painel com cliques, cadastros e comissões em tempo real",
      "Cadastro gratuito e sem compromisso",
    ],
  },
  product: {
    eyebrow: "O produto",
    title: "O que é o Break",
    lead: "Troque a rolagem sem fim pela vida real.",
    body: "O Break é um app para iPhone que coloca uma pausa entre você e os apps que mais roubam seu tempo. Veja tudo o que você vai indicar.",
    taglines: ["Quebre o ciclo da dopamina.", "Recupere o seu tempo.", "Saia do scroll, esteja presente de novo."],
    features: [
      {
        title: "Bloqueio de apps",
        text: "O Break protege redes sociais como Instagram, TikTok e YouTube com um desafio de dez segundos antes de abrir. No plano gratuito, você protege um app; no Pro, vários.",
      },
      {
        title: "Desafios",
        text: "Quando você tenta abrir um app bloqueado, o Break não só bloqueia: ele propõe um mini-jogo. Ordenar bolas, respiração profunda, caça-palavras, combinar peças, mahjong, flow ou desafio bíblico.",
      },
      {
        title: "Modo Sono",
        text: "Um bloqueio noturno que protege a sua noite do piloto automático. Você dorme melhor e acorda sem ter perdido horas na tela.",
      },
      {
        title: "Navegação segura",
        text: "Proteção contra sites pornográficos direto no navegador. Uma camada extra para manter o foco no que importa.",
      },
      {
        title: "Limite diário",
        text: "Você controla quantas liberações faz por dia. São três níveis: Em transição, Recomendado e Modo Foco Extremo.",
      },
      {
        title: "Liberar uma hora",
        text: "Quando precisar, você ganha uma hora, uma hora e meia ou duas horas de uso livre. Disponível três vezes por semana.",
      },
      {
        title: "Tempo de tela e tempo salvo",
        text: "Gráficos por dia, semana, mês, trimestre, semestre e ano. Você vê exatamente quanto tempo voltou para a vida real.",
      },
      {
        title: "Plano Pro anual",
        text: "US$ 49,99 por ano, com sete dias grátis e cancelamento quando quiser. Inclui tudo o que o plano gratuito não tem.",
        highlight: "US$ 49,99/ano",
      },
    ],
  },
  how: {
    eyebrow: "Como funciona",
    title: "Rastreamento por link, sem complicação",
    body: "Todas as indicações são registradas automaticamente pelo seu link. Você só precisa compartilhar.",
    steps: [
      {
        title: "Receba seu link exclusivo",
        text: "Ao se cadastrar, você ganha um link de afiliado único para compartilhar onde quiser: redes sociais, YouTube, newsletter ou com amigos.",
      },
      {
        title: "Rastreamos cada indicação",
        text: "Quando alguém clica no seu link, um cookie identifica você como responsável pela indicação. Se a pessoa assinar depois, a venda continua sendo sua.",
      },
      {
        title: "Ganhe 30% em cada assinatura",
        text: "Para cada assinatura anual feita pelo seu link, você recebe 30% do valor pago, acompanhando tudo em tempo real no seu painel.",
      },
      {
        title: "Comissão recorrente",
        text: "Enquanto o cliente renovar a assinatura anual, você continua recebendo 30% a cada renovação. Uma indicação, ganhos todo ano.",
      },
    ],
  },
  final: {
    title: "Pronto para começar a ganhar?",
    body: "Crie sua conta de afiliado, pegue seu link e comece a indicar o Break hoje mesmo.",
  },
}

type AffiliateCopy = typeof pt

const es: AffiliateCopy = {
  metaTitle: "Programa de Afiliados Break",
  metaDescription: "Recomienda Break y gana un 30% de comisión recurrente en cada suscripción anual.",
  cta: "Quiero ser afiliado",
  rights: "Todos los derechos reservados.",
  hero: {
    logoAlt: "Logo de Break",
    eyebrow: "Programa de afiliados",
    title: "Programa de Afiliados Break",
    subtitleStart: "Recomienda Break y gana un ",
    subtitleHighlight: "30% de comisión recurrente",
    subtitleEnd: " en cada suscripción anual. Mientras el cliente renueve, sigues cobrando.",
    note: "Registro gratuito. Toma menos de un minuto.",
  },
  commission: {
    eyebrow: "Comisión",
    title: "30% en cada suscripción, todos los años",
    body: "La comisión no se paga una sola vez. Cada suscripción anual que recomiendes genera el 30% del valor en la primera compra y de nuevo en cada renovación, mientras el cliente siga suscrito.",
    badge: "Recurrente",
    per: "por suscripción anual",
    paid: "Se paga en la compra y en cada renovación",
    perks: [
      "30% de comisión recurrente en cada suscripción anual",
      "Seguimiento automático por enlace y cookie",
      "Panel con clics, registros y comisiones en tiempo real",
      "Registro gratuito y sin compromiso",
    ],
  },
  product: {
    eyebrow: "El producto",
    title: "Qué es Break",
    lead: "Cambia el scroll infinito por la vida real.",
    body: "Break es una app para iPhone que pone una pausa entre tú y las apps que más tiempo te roban. Mira todo lo que vas a recomendar.",
    taglines: ["Rompe el ciclo de la dopamina.", "Recupera tu tiempo.", "Sal del scroll y vuelve a estar presente."],
    features: [
      {
        title: "Bloqueo de apps",
        text: "Break protege redes sociales como Instagram, TikTok y YouTube con un desafío de diez segundos antes de abrirlas. En el plan gratuito proteges una app; en Pro, varias.",
      },
      {
        title: "Desafíos",
        text: "Cuando intentas abrir una app bloqueada, Break no solo la bloquea: te propone un minijuego. Ordenar bolas, respiración profunda, sopa de letras, unir piezas, mahjong, flow o desafío bíblico.",
      },
      {
        title: "Modo Sueño",
        text: "Un bloqueo nocturno que protege tu noche del piloto automático. Duermes mejor y te despiertas sin haber perdido horas en la pantalla.",
      },
      {
        title: "Navegación segura",
        text: "Protección contra sitios pornográficos directamente en el navegador. Una capa extra para mantener el foco en lo que importa.",
      },
      {
        title: "Límite diario",
        text: "Tú controlas cuántos desbloqueos haces al día. Hay tres niveles: En transición, Recomendado y Modo Foco Extremo.",
      },
      {
        title: "Liberar una hora",
        text: "Cuando lo necesites, obtienes una hora, una hora y media o dos horas de uso libre. Disponible tres veces por semana.",
      },
      {
        title: "Tiempo de pantalla y tiempo ahorrado",
        text: "Gráficos por día, semana, mes, trimestre, semestre y año. Ves exactamente cuánto tiempo volvió a la vida real.",
      },
      {
        title: "Plan Pro anual",
        text: "49,99 USD al año, con siete días gratis y cancelación cuando quieras. Incluye todo lo que el plan gratuito no tiene.",
        highlight: "49,99 USD/año",
      },
    ],
  },
  how: {
    eyebrow: "Cómo funciona",
    title: "Seguimiento por enlace, sin complicaciones",
    body: "Todas las recomendaciones se registran automáticamente con tu enlace. Solo tienes que compartirlo.",
    steps: [
      {
        title: "Recibe tu enlace exclusivo",
        text: "Al registrarte, obtienes un enlace de afiliado único para compartir donde quieras: redes sociales, YouTube, newsletter o con amigos.",
      },
      {
        title: "Rastreamos cada recomendación",
        text: "Cuando alguien hace clic en tu enlace, una cookie te identifica como responsable de la recomendación. Si la persona se suscribe después, la venta sigue siendo tuya.",
      },
      {
        title: "Gana un 30% en cada suscripción",
        text: "Por cada suscripción anual hecha con tu enlace, recibes el 30% del valor pagado y lo sigues todo en tiempo real en tu panel.",
      },
      {
        title: "Comisión recurrente",
        text: "Mientras el cliente renueve la suscripción anual, sigues recibiendo el 30% en cada renovación. Una recomendación, ganancias cada año.",
      },
    ],
  },
  final: {
    title: "¿Listo para empezar a ganar?",
    body: "Crea tu cuenta de afiliado, obtén tu enlace y empieza a recomendar Break hoy mismo.",
  },
}

const en: AffiliateCopy = {
  metaTitle: "Break Affiliate Program",
  metaDescription: "Refer Break and earn a 30% recurring commission on every annual subscription.",
  cta: "Become an affiliate",
  rights: "All rights reserved.",
  hero: {
    logoAlt: "Break logo",
    eyebrow: "Affiliate program",
    title: "Break Affiliate Program",
    subtitleStart: "Refer Break and earn a ",
    subtitleHighlight: "30% recurring commission",
    subtitleEnd: " on every annual subscription. As long as the customer renews, you keep getting paid.",
    note: "Free to join. Takes less than a minute.",
  },
  commission: {
    eyebrow: "Commission",
    title: "30% on every subscription, every year",
    body: "The commission isn't a one-time payout. Every annual subscription you refer earns you 30% of the price on the first purchase and again on every renewal, for as long as the customer stays subscribed.",
    badge: "Recurring",
    per: "per annual subscription",
    paid: "Paid on purchase and every renewal",
    perks: [
      "30% recurring commission on every annual subscription",
      "Automatic link and cookie tracking",
      "Real-time dashboard with clicks, signups and commissions",
      "Free to join, no commitment",
    ],
  },
  product: {
    eyebrow: "The product",
    title: "What is Break",
    lead: "Trade endless scrolling for real life.",
    body: "Break is an iPhone app that puts a pause between you and the apps that steal the most of your time. Here is everything you will be recommending.",
    taglines: ["Break the dopamine loop.", "Get your time back.", "Leave the scroll and be present again."],
    features: [
      {
        title: "App blocking",
        text: "Break protects social apps like Instagram, TikTok and YouTube with a ten-second challenge before they open. On the free plan you protect one app; on Pro, as many as you want.",
      },
      {
        title: "Challenges",
        text: "When you try to open a blocked app, Break doesn't just block it: it offers a mini-game. Ball sort, deep breathing, word search, tile matching, mahjong, flow or a Bible challenge.",
      },
      {
        title: "Sleep Mode",
        text: "A nighttime block that protects your evening from autopilot. You sleep better and wake up without having lost hours on the screen.",
      },
      {
        title: "Safe browsing",
        text: "Protection against pornographic websites right in the browser. An extra layer to keep your focus on what matters.",
      },
      {
        title: "Daily limit",
        text: "You control how many unlocks you get per day. There are three levels: In Transition, Recommended and Extreme Focus Mode.",
      },
      {
        title: "Unlock an hour",
        text: "When you need it, you get one hour, an hour and a half or two hours of free use. Available three times a week.",
      },
      {
        title: "Screen time and time saved",
        text: "Charts by day, week, month, quarter, half-year and year. You see exactly how much time went back to real life.",
      },
      {
        title: "Annual Pro plan",
        text: "$49.99 per year, with a seven-day free trial and cancel anytime. Includes everything the free plan doesn't.",
        highlight: "$49.99/year",
      },
    ],
  },
  how: {
    eyebrow: "How it works",
    title: "Link tracking, no hassle",
    body: "Every referral is recorded automatically through your link. All you have to do is share it.",
    steps: [
      {
        title: "Get your unique link",
        text: "When you sign up, you get a unique affiliate link to share anywhere: social media, YouTube, newsletters or with friends.",
      },
      {
        title: "We track every referral",
        text: "When someone clicks your link, a cookie identifies you as the referrer. If they subscribe later, the sale is still yours.",
      },
      {
        title: "Earn 30% on every subscription",
        text: "For every annual subscription made through your link, you get 30% of the amount paid, and you can follow it all in real time on your dashboard.",
      },
      {
        title: "Recurring commission",
        text: "As long as the customer renews their annual subscription, you keep earning 30% on every renewal. One referral, earnings every year.",
      },
    ],
  },
  final: {
    title: "Ready to start earning?",
    body: "Create your affiliate account, grab your link and start recommending Break today.",
  },
}

export const AFFILIATE_COPY: Record<AffiliateLocale, AffiliateCopy> = { pt, es, en }
