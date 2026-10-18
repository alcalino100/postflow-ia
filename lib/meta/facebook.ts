export async function testFacebookConnection(pageId: string, token: string) {
  if (!pageId || !token) return { ok: false, error: "Campos obrigatórios" }
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=name,id&access_token=${encodeURIComponent(token)}`, { cache: "no-store" })
    const data = await res.json()
    if (data.error) return { ok: false, error: data.error.message }
    return { ok: true, name: data.name, id: data.id }
  } catch (e: any) {
    return { ok: false, error: e?.message || "Falha de rede" }
  }
}

export async function publishFacebookPost(pageId: string, token: string, message: string) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, access_token: token }),
  })
  return res.json()
}
