"use server"

import { testFacebookConnection } from "@/lib/meta/facebook"
import { testInstagramConnection } from "@/lib/meta/instagram"

export async function testMetaConnection(pageId: string, igUserId: string, token: string) {
  const fb = await testFacebookConnection(pageId, token)
  const ig = igUserId ? await testInstagramConnection(igUserId, token) : { ok: false, error: "IG User ID vazio" }
  return { facebook: fb, instagram: ig }
}
