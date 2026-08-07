import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import verifyToken from "@/app/utils/verifyToken";
import { ingredientSchema } from "@/app/utils/schemas";

export async function POST(request: Request) {
  const reqBody = await request.json()
  const payload = await verifyToken(request)
  
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const result = ingredientSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json(
          { message: result.error.issues[0].message },
          { status: 400 }
        )
      }
      const { error } = await supabase
        .from("ingredients")
        .insert({
          user_id: payload.userId,
          name: result.data.name,
          purchase_price: result.data.purchasePrice,
          purchase_quantity: result.data.purchaseQuantity,
          unit: result.data.unit
        })
      if (error) throw new Error(error.message)
      return NextResponse.json({ message: "食材登録成功" }, { status: 201 })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラーです"
      if (errorMessage.includes("duplicate key")) {
        return NextResponse.json({ message: "同じ名前の食材が既に登録されています" }, { status: 400 })
      }
      return NextResponse.json({ message: "食材登録に失敗しました" }, { status: 500 })
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
        .from("ingredients")
        .select()
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      return NextResponse.json({
        message: "食材一覧の取得成功",
        ingredients: data
      },
        { status: 200 }
      )
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "食材一覧の取得失敗" }, { status: 500 })
    }
  }
}
