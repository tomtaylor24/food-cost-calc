import verifyToken from "@/app/utils/verifyToken";
import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { ingredientSchema } from "@/app/utils/schemas";
import readJson from "@/app/utils/readJson";
import { DbError, isUniqueViolation, isNotFound, isForeignKeyViolation } from "@/app/utils/dbError";

type Context = {
  params: Promise<{ id: string }>
}

type PriceSnapshot = {
  purchase_price: number
  purchase_quantity: number
  yield_rate: number
  tax_add_rate: number
}

export async function GET(request: Request, context: Context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const params = await context.params
      const { data, error } = await supabase
        .from("ingredients")
        .select("*, dish_ingredients(count), ingredient_price_history(id, purchase_price, purchase_quantity, yield_rate, tax_add_rate, changed_at)")
        .eq("id", params.id)
        .eq("user_id", payload.userId)
        .order("changed_at", { referencedTable: "ingredient_price_history", ascending: false })
        .limit(10, { referencedTable: "ingredient_price_history" })
        .single()
      if (error) throw new DbError(error)
      return NextResponse.json({ message: "食材詳細取得成功", ingredient: data }, { status: 200 })
    } catch (error) {
      console.log(error)
      if (isNotFound(error)) {
        return NextResponse.json({ message: "食材が見つかりません" }, { status: 404 })
      }
      return NextResponse.json({ message: "食材の取得に失敗しました" }, { status: 500 })
    }
  }
}

export async function PUT(request: Request, context: Context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const reqBody = await readJson(request)
      if (reqBody === null) {
        return NextResponse.json({ message: "リクエストの形式が正しくありません" }, { status: 400 })
      }
      const params = await context.params
      const result = ingredientSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
      }
      const { data: oldRow, error: oldError } = await supabase
        .from("ingredients")
        .select("purchase_price, purchase_quantity, yield_rate, tax_add_rate")
        .eq("id", params.id)
        .eq("user_id", payload.userId)
        .single()
      if (oldError) throw new DbError(oldError)

      const { error } = await supabase.from("ingredients")
        .update({
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
        .eq("id", params.id)
        .eq("user_id", payload.userId)
        .select()
        .single()
      if (error) throw new DbError(error)

      const previous = oldRow as PriceSnapshot
      const isPriceChanged =
        previous.purchase_price !== result.data.purchasePrice ||
        previous.purchase_quantity !== result.data.purchaseQuantity ||
        previous.yield_rate !== result.data.yieldRate ||
        previous.tax_add_rate !== result.data.taxAddRate

      if (isPriceChanged) {
        const { error: historyError } = await supabase
          .from("ingredient_price_history")
          .insert({
            ingredient_id: Number(params.id),
            purchase_price: result.data.purchasePrice,
            purchase_quantity: result.data.purchaseQuantity,
            yield_rate: result.data.yieldRate,
            tax_add_rate: result.data.taxAddRate
          })
        if (historyError) console.log(historyError)
      }

      return NextResponse.json({ message: "食材編集成功" }, { status: 200 })
    } catch (error) {
      console.log(error)
      if (isUniqueViolation(error)) {
        return NextResponse.json({ message: "同じ名前の食材が既に登録されています" }, { status: 400 })
      }
      if (isNotFound(error)) {
        return NextResponse.json({ message: "食材が見つかりません" }, { status: 404 })
      }
      return NextResponse.json({ message: "食材編集に失敗しました" }, { status: 500 })
    }
  }
}

export async function DELETE(request: Request, context: Context) {
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
      if (error) throw new DbError(error)
      return NextResponse.json({ message: "食材削除成功" }, { status: 200 })
    } catch (error) {
      console.log(error)
      if (isForeignKeyViolation(error)) {
        return NextResponse.json({ message: "この食材は商品で使われているため削除できません" }, { status: 400 })
      }
      return NextResponse.json({ message: "食材の削除に失敗しました" }, { status: 500 })
    }
  }
}
