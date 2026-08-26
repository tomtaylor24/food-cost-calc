import { NextResponse } from "next/server"
import supabase from "@/app/utils/database"
import { forgotPasswordSchema } from "@/app/utils/schemas"
import readJson from "@/app/utils/readJson"
import hashToken from "@/app/utils/hashToken"
import { DbError, isNotFound } from "@/app/utils/dbError"
import sendResetMail from "@/app/utils/mailer"

const TOKEN_LIFETIME_MINUTES = 15
const RESEND_INTERVAL_SECONDS = 60
const APP_URL = process.env.APP_URL ?? "http://localhost:3000"
const SENT_MESSAGE = "パスワード再設定用のメールを送信しました。届かない場合は、そのアドレスが登録されていない可能性があります"

export async function POST(request: Request) {
  try {
    const reqBody = await readJson(request)
    if (reqBody === null) {
      return NextResponse.json({ message: "リクエストの形式が正しくありません" }, { status: 400 })
    }
    const result = forgotPasswordSchema.safeParse(reqBody)
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
    }
    const { data, error } = await supabase.from("users")
      .select("id")
      .eq("email", result.data.email)
      .single()
    if (error) throw new DbError(error)
    const user = data as { id: string }

    const recentAt = new Date(Date.now() - RESEND_INTERVAL_SECONDS * 1000).toISOString()
    const { data: recent, error: recentError } = await supabase
      .from("password_reset_tokens")
      .select("id")
      .eq("user_id", user.id)
      .gt("created_at", recentAt)
      .limit(1)
    if (recentError) throw new DbError(recentError)
    if (recent.length > 0) {
      return NextResponse.json({ message: SENT_MESSAGE }, { status: 200 })
    }

    const token = crypto.randomUUID()
    const tokenHash = await hashToken(token)
    const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MINUTES * 60 * 1000).toISOString()
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt
      })
    if (insertError) throw new DbError(insertError)
    const resetUrl = `${APP_URL}/user/reset-password/${token}`
    await sendResetMail(result.data.email, resetUrl)
    return NextResponse.json({ message: SENT_MESSAGE }, { status: 200 })
  } catch (error) {
    console.log(error)
    if (isNotFound(error)) {
      return NextResponse.json({ message: SENT_MESSAGE }, { status: 200 })
    }
    return NextResponse.json({ message: "パスワード再設定メールの送信に失敗しました" }, { status: 500 })
  }
}
