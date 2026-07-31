import { NextResponse } from "next/server"
import supabase from "@/app/utils/database"
import verifyToken from "@/app/utils/verifyToken"

export async function POST(request) {
  const reqBody = await request.json()
  const payload = await verifyToken(request)

  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const { error } = await supabase
        .from("dishes")
        .insert({
          user_id: payload.userId,
          name: reqBody.name,
          selling_price: Number(reqBody.sellingPrice)
        })
      if (error) throw new Error(error.message)
      return NextResponse.json({ message: "商品登録成功" }, { status: 201 })
    } catch (error) {
      return NextResponse.json({ message: `商品登録失敗: ${error.message}` }, { status: 500 })
    }
  }
}

export async function GET(request) {
  const payload = await verifyToken(request)

  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const { data, error } = await supabase
        .from("dishes")
        .select()
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      return NextResponse.json({
        message: "商品一覧の取得成功",
        dishes: data
      }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ message: `商品一覧の取得失敗: ${error.message}` }, { status: 500 })
    }
  }
}
