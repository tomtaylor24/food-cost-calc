import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import verifyToken from "@/app/utils/verifyToken";
import { ingredientSchema } from "@/app/utils/schemas";
import readJson from "@/app/utils/readJson";
import type { Ingredient } from "@/app/types";
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
      const result = ingredientSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json(
          { message: result.error.issues[0].message },
          { status: 400 }
        )
      }
      const { data, error } = await supabase
        .from("ingredients")
        .insert({
          user_id: payload.userId,
          name: result.data.name,
          name_kana: result.data.nameKana,
          purchase_price: result.data.purchasePrice,
          purchase_quantity: result.data.purchaseQuantity,
          unit: result.data.unit,
          yield_rate: result.data.yieldRate,
          tax_add_rate: result.data.taxAddRate,
          supplier: result.data.supplier,
          note: result.data.note
        })
        .select("id")
        .single()
      if (error) throw new DbError(error)

      const inserted = data as { id: number }
      const { error: historyError } = await supabase
        .from("ingredient_price_history")
        .insert({
          ingredient_id: inserted.id,
          purchase_price: result.data.purchasePrice,
          purchase_quantity: result.data.purchaseQuantity,
          yield_rate: result.data.yieldRate,
          tax_add_rate: result.data.taxAddRate
        })
      if (historyError) console.log(historyError)

      return NextResponse.json({ message: "食材登録成功" }, { status: 201 })
    } catch (error) {
      console.log(error)
      if (isUniqueViolation(error)) {
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
        .order("name_kana", { nullsFirst: false })
        .order("name")
      if (error) throw new DbError(error)
      return NextResponse.json({
        message: "食材一覧の取得成功",
        ingredients: data as Ingredient[]
      },
        { status: 200 }
      )
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "食材一覧の取得失敗" }, { status: 500 })
    }
  }
}
