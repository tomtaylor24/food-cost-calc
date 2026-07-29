import verifyToken from "@/app/utils/verifyToken";
import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

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
      return NextResponse.json({ message: `食材詳細取得失敗: ${error.message}` }, { status: 404 })
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
      const { error } = await supabase.from("ingredients")
        .update({
          name: reqBody.name,
          purchase_price: Number(reqBody.purchasePrice),
          purchase_quantity: Number(reqBody.purchaseQuantity),
          unit: reqBody.unit
        })
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      return NextResponse.json({ message: "食材編集成功" }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ message: `食材編集失敗: ${error.message}` }, { status: 500 })
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
      return NextResponse.json({ message: `食材削除失敗: ${error.message}` }, { status: 500 })
    }
  }
}
