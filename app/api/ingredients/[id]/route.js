import verifyToken from "@/app/utils/verifyToken";
import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { ingredientSchema } from "@/app/utils/schemas";

export async function GET(request, context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const params = await context.params
      const { data, error } = await supabase.from("ingredients").select().eq("id", params.id).eq("user_id", payload.userId).single()
      if (error) throw new Error(error.message)
      return NextResponse.json({ message: "食材詳細取得成功", ingredient: data }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: 食材詳細取得失敗 }, { status: 404 })
    }
  }
}

export async function PUT(request, context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const reqBody = await request.json()
      const params = await context.params
      const result = ingredientSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
      }
      const { error } = await supabase.from("ingredients")
        .update({
          name: result.data.name,
          purchase_price: result.data.purchasePrice,
          purchase_quantity: result.data.purchaseQuantity,
          unit: result.data.unit
        })
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      return NextResponse.json({ message: "食材編集成功" }, { status: 200 })
    } catch (error) {
      if (error.message.includes("duplicate key")) {
        return NextResponse.json({ message: "同じ名前の食材が既に登録されています" }, { status: 400 })
      }
      return NextResponse.json({ message: "食材編集に失敗しました" }, { status: 500 })
    }
  }
}

export async function DELETE(request, context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const params = await context.params
      const { error } = await supabase.from("ingredients")
        .delete()
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      return NextResponse.json({ message: "食材削除成功" }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: 食材削除失敗}, { status: 500 })
    }
  }
}
