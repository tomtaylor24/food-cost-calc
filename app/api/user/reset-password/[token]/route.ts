import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import supabase from "@/app/utils/database"
import { resetPasswordSchema } from "@/app/utils/schemas"
import readJson from "@/app/utils/readJson"
import hashToken from "@/app/utils/hashToken"
import { DbError, isNotFound } from "@/app/utils/dbError"

type Props = {
  params: Promise<{ token: string }>
}

export async function POST(request: Request, context: Props) {
  try {
    const reqBody = await readJson(request)
    if (reqBody === null) {
      return NextResponse.json({ message: "リクエストの形式が正しくありません" }, { status: 400 })
    }
    const result = resetPasswordSchema.safeParse(reqBody)
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
    }
    const params = await context.params
    const tokenHash = await hashToken(params.token)
    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at")
      .eq("token_hash", tokenHash)
      .single()
    if (error) throw new DbError(error)
    const resetToken = data as { user_id: string, expires_at: string }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ message: "このリンクは無効か、有効期限が切れています" }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", resetToken.user_id)
    if (deleteError) throw new DbError(deleteError)

    const passwordHash = await bcrypt.hash(result.data.password, 10)
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", resetToken.user_id)
    if (updateError) throw new DbError(updateError)

    return NextResponse.json({ message: "パスワードを再設定しました" }, { status: 200 })
  } catch (error) {
    console.log(error)
    if (isNotFound(error)) {
      return NextResponse.json({ message: "このリンクは無効か、有効期限が切れています" }, { status: 400 })
    }
    return NextResponse.json({ message: "パスワードの再設定に失敗しました" }, { status: 500 })
  }
}
