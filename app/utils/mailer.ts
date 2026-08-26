const BREVO_API_KEY = process.env.BREVO_API_KEY
const MAIL_FROM = process.env.MAIL_FROM
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME ?? "Genkalc"

const sendResetMail = async (to: string, resetUrl: string) => {
  const subject = "【Genkalc】パスワード再設定のご案内"
  const textContent = [
    "Genkalc のパスワード再設定のリクエストを受け付けました。",
    "",
    "下のリンクを開いて、新しいパスワードを設定してください。",
    resetUrl,
    "",
    "このリンクは15分で無効になります。",
    "心当たりがない場合は、このメールを破棄してください。"
  ].join("\n")

  if (!BREVO_API_KEY || !MAIL_FROM) {
    console.log("--- メール送信（開発モード：実際には送っていません） ---")
    console.log(`宛先: ${to}`)
    console.log(`件名: ${subject}`)
    console.log(textContent)
    console.log("--------------------------------------------------")
    return
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender: { name: MAIL_FROM_NAME, email: MAIL_FROM },
      to: [{ email: to }],
      subject: subject,
      textContent: textContent
    })
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`メール送信に失敗しました (${response.status}) ${detail}`)
  }
}

export default sendResetMail
