import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import bcrypt from "bcryptjs";
import { userSchema } from "@/app/utils/schemas";
import { issueToken } from "@/app/utils/jwt";
import readJson from "@/app/utils/readJson";
import type { User } from "@/app/types";
import { DbError, isUniqueViolation } from "@/app/utils/dbError";

export async function POST(request: Request) {
  try {
    const reqBody = await readJson(request)
    if (reqBody === null) {
    return NextResponse.json({ message: "リクエストの形式が正しくありません" }, { status: 400 })
    }
    const result = userSchema.safeParse(reqBody)
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(result.data.password, 10)
    const { data, error } = await supabase.from("users")
      .insert({
        email: result.data.email,
        password_hash: hashedPassword
      })
      .select()
      .single()
    if (error) throw new DbError(error)
    const user = data as User
    const token = await issueToken(user.id, result.data.email)
    return NextResponse.json({ message: "ユーザー登録成功", token: token }, { status: 201 })
  } catch (error) {
    console.log(error)
    if (isUniqueViolation(error)) {
      return NextResponse.json({ message: "このメールアドレスはすでに登録されています" }, { status: 400 })
    }
    return NextResponse.json({ message: "ユーザー登録に失敗しました" }, { status: 500 })
  }
}
