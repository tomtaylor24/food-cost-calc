const hashToken = async (token: string) => {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))

  const bytes = new Uint8Array(buffer)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

export default hashToken
