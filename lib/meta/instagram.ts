export async function testInstagramConnection(igUserId: string, token: string) {
  if (!igUserId || !token) return { ok: false, error: "Campos obrigatórios" }
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${igUserId}?fields=username,id&access_token=${encodeURIComponent(token)}`, { cache: "no-store" })
    const data = await res.json()
    if (data.error) return { ok: false, error: data.error.message }
    return { ok: true, name: data.username, id: data.id }
  } catch (e: any) {
    return { ok: false, error: e?.message || "Falha de rede" }
  }
}
