const CHECK_PATH = "/api/user/login"

const keepalive = async () => {
  const base = process.env.URL ?? process.env.APP_URL

  if (!base) {
    console.error("keepalive: サイトのURLが取得できませんでした")
    return new Response("site url is not available", { status: 500 })
  }

  try {
    const response = await fetch(base + CHECK_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "keepalive@example.com",
        password: "keepalive-not-a-real-account"
      })
    })

    if (response.status !== 401) {
      console.error(`keepalive: DBに到達できませんでした (HTTP ${response.status})`)
      return new Response(`unexpected status ${response.status}`, { status: 500 })
    }

    console.log("keepalive: DBまで到達しました")
    return new Response("ok")
  } catch (error) {
    console.error("keepalive: リクエストに失敗しました", error)
    return new Response("request failed", { status: 500 })
  }
}

export default keepalive

export const config = { schedule: "@hourly" }
