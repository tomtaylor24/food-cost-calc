import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import verifyToken from "@/app/utils/verifyToken";
import { categorySchema } from "@/app/utils/schemas";
import readJson from "@/app/utils/readJson";
import type { Category } from "@/app/types";
import { DbError, isUniqueViolation } from "@/app/utils/dbError";

export async function POST(request: Request) {
  const payload = await verifyToken(request)

  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const reqBody = await readJson(request)
      if (reqBody === null) {
      return NextResponse.json({ message: "リクエストの形式が正しくありません" }, { status: 400 })
      }
      const result = categorySchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json(
          { message: result.error.issues[0].message },
          { status: 400 }
        )
      }
      const { data, error } = await supabase
        .from("categories")
        .insert({
          user_id: payload.userId,
          name: result.data.name
        })
        .select()
        .single()
      if (error) throw new DbError(error)
      return NextResponse.json({ 
        message: "カテゴリー登録成功",
        category: data as Category 
      }, { status: 201 })
    } catch (error) {
      if (isUniqueViolation(error)) {
        return NextResponse.json({ message: "同じ名前のカテゴリーが既に登録されています" }, { status: 400 })
      }
      return NextResponse.json({ message: "カテゴリー登録に失敗しました" }, { status: 500 })
    }
  }
}


export async function GET(request: Request) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select()
        .eq("user_id", payload.userId)
        .order("name")
      if (error) throw new DbError(error)
      return NextResponse.json({
        message: "カテゴリー一覧の取得成功",
        categories: data as Category[]
      },
        { status: 200 }
      )
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "カテゴリー一覧の取得失敗" }, { status: 500 })
    }
  }
}
