export type Network = "facebook" | "instagram"
export type ContentType = "post" | "carousel" | "reel"
export type PostStatus = "scheduled" | "publishing" | "published" | "failed" | "paused"

export interface ScheduledPost {
  id: string
  thumbnail: string
  type: ContentType
  network: Network
  caption: string
  scheduledAt: string
  status: PostStatus
  metaPostId?: string
  error?: string
}

const captions = [
  "Novo drop da coleção outono. Peças limitadas, garanta a sua antes que acabe.",
  "Bastidores do shooting de hoje. Qual look você mais curtiu?",
  "Dica rápida: 3 formas de combinar nosso produto no dia a dia.",
  "Reel de lançamento — arrasta pro lado e confere os detalhes.",
  "Promo relâmpago até sexta: 20% off em toda a linha.",
]

export const mockPosts: ScheduledPost[] = [
  { id: "p1", thumbnail: "https://picsum.photos/seed/p1/80/80", type: "post", network: "facebook", caption: captions[0], scheduledAt: "2026-10-19T09:00:00-03:00", status: "scheduled" },
  { id: "p2", thumbnail: "https://picsum.photos/seed/p2/80/80", type: "reel", network: "instagram", caption: captions[1], scheduledAt: "2026-10-19T12:30:00-03:00", status: "scheduled" },
  { id: "p3", thumbnail: "https://picsum.photos/seed/p3/80/80", type: "carousel", network: "instagram", caption: captions[2], scheduledAt: "2026-10-18T18:00:00-03:00", status: "published", metaPostId: "17890..." },
  { id: "p4", thumbnail: "https://picsum.photos/seed/p4/80/80", type: "reel", network: "facebook", caption: captions[3], scheduledAt: "2026-10-17T15:00:00-03:00", status: "failed", error: "Token expirado: renove o Page Access Token." },
  { id: "p5", thumbnail: "https://picsum.photos/seed/p5/80/80", type: "post", network: "instagram", caption: captions[4], scheduledAt: "2026-10-20T10:00:00-03:00", status: "paused" },
  { id: "p6", thumbnail: "https://picsum.photos/seed/p6/80/80", type: "reel", network: "instagram", caption: captions[0], scheduledAt: "2026-10-21T11:00:00-03:00", status: "scheduled" },
]

export const kpis = {
  scheduled: 12,
  reels: 7,
  next24h: 3,
  avgEngagement: 4.6,
}

export const calendarEvents = mockPosts.map((p) => ({
  id: p.id,
  date: p.scheduledAt.slice(0, 10),
  network: p.network,
  type: p.type,
  status: p.status,
  caption: p.caption,
}))

export interface MetricRow {
  id: string
  thumbnail: string
  caption: string
  type: ContentType
  network: Network
  date: string
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagement: number
}

export const metricsRows: MetricRow[] = [
  { id: "m1", thumbnail: "https://picsum.photos/seed/m1/60/60", caption: "Reel de lançamento da coleção", type: "reel", network: "instagram", date: "2026-10-10", reach: 12400, likes: 890, comments: 74, shares: 120, saves: 310, engagement: 10.9 },
  { id: "m2", thumbnail: "https://picsum.photos/seed/m2/60/60", caption: "Carrossel de dicas de styling", type: "carousel", network: "instagram", date: "2026-10-08", reach: 9800, likes: 620, comments: 48, shares: 88, saves: 240, engagement: 9.4 },
  { id: "m3", thumbnail: "https://picsum.photos/seed/m3/60/60", caption: "Post promocional 20% off", type: "post", network: "facebook", date: "2026-10-05", reach: 7200, likes: 310, comments: 22, shares: 45, saves: 12, engagement: 5.4 },
]

export const reportKpis = {
  publications: 48,
  reach: 184200,
  impressions: 291000,
  engagement: 14230,
  avgEngagement: 5.8,
  bestFormat: "Reel",
}

export const reportKpisPrev = {
  publications: 42,
  reach: 160100,
  impressions: 254000,
  engagement: 12100,
  avgEngagement: 5.1,
  bestFormat: "Carrossel",
}

export const dailySeries = Array.from({ length: 14 }, (_, i) => ({
  date: `10/${String(5 + i).padStart(2, "0")}`,
  publicacoes: Math.round(2 + Math.sin(i) * 1.5),
  engajamento: Math.round(800 + Math.cos(i / 2) * 300 + i * 40),
}))

export const formatSeries = [
  { format: "Reel", value: 42 },
  { format: "Carrossel", value: 28 },
  { format: "Post", value: 18 },
]

export const networkSeries = [
  { name: "Instagram", value: 62 },
  { name: "Facebook", value: 38 },
]

export const hourSeries = [
  { hour: "08h", value: 320 },
  { hour: "10h", value: 540 },
  { hour: "12h", value: 710 },
  { hour: "15h", value: 620 },
  { hour: "18h", value: 890 },
  { hour: "20h", value: 760 },
]

export interface QueueLog {
  postId: string
  attempts: number
  lastAttempt: string
  message: string
  status: PostStatus
}

export const queueLogs: QueueLog[] = [
  { postId: "p4", attempts: 3, lastAttempt: "2026-10-17T15:05:00-03:00", message: "Meta API: OAuthException #190 - Token expired", status: "failed" },
]

export const aiVariations = [
  { id: "v1", label: "Curta", caption: "Coleção outono chegou. Peças limitadas — garanta a sua agora. #moda #outono", hashtags: ["#moda", "#outono", "#novidades"], cta: "Compre agora" },
  { id: "v2", label: "Média", caption: "A nova coleção outono está no ar. Looks pensados para o seu dia a dia, com qualidade e estilo. Qual peça é a sua favorita? #moda #outono #estilo", hashtags: ["#moda", "#outono", "#estilo"], cta: "Veja mais" },
  { id: "v3", label: "Storytelling", caption: "Tudo começou com uma ideia simples: criar peças que você ama vestir. Hoje lançamos a coleção outono. Vem com a gente nessa história. #moda #outono #bastidores", hashtags: ["#moda", "#outono", "#bastidores"], cta: "Descubra" },
]
