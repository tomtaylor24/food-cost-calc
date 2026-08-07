import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import bcrypt from "bcryptjs";
import { userSchema } from "@/app/utils/schemas";

export async function POST(request: Request) {
  const reqBody = await request.json()
  try {
    const result = userSchema.safeParse(reqBody)
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(result.data.password, 10)
    const { error } = await supabase.from("users")
      .insert({
        email: result.data.email,
        password_hash: hashedPassword
      })
    if (error) throw new Error(error.message)
    return NextResponse.json({ message: "ユーザー登録成功" }, { status: 201 })
  } catch (error) {
    console.log(error)
    const errorMessage = error instanceof Error ? error.message : "不明なエラー"
    if (errorMessage.includes("duplicate key")) {
      return NextResponse.json({ message: "このメールアドレスはすでに登録されています" }, { status: 400 })
    }
    return NextResponse.json({ message: "ユーザー登録に失敗しました" }, { status: 500 })
  }

}
