import { NextResponse } from "next/server"
import supabase from "@/app/utils/database"
import verifyToken from "@/app/utils/verifyToken"
import { dishSchema } from "@/app/utils/schemas"

export async function GET(request, context) {
  const payload = await verifyToken(request)

  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const params = await context.params
      const { data, error } = await supabase
        .from("dishes")
        .select("*, dish_ingredients(id, ingredient_id, quantity, ingredients(name, unit, purchase_price, purchase_quantity))")
        .eq("id", params.id)
        .eq("user_id", payload.userId)
        .single()
      if (error) throw new Error(error.message)
      return NextResponse.json({
        message: "商品詳細取得成功",
        dish: data
      }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "商品詳細取得失敗" }, { status: 404 })
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
      const result = dishSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
      }

      for (const row of result.data.rows) {
        const { error: ingredientError } = await supabase
          .from("ingredients")
          .select("id")
          .eq("id", Number(row.ingredientId))
          .eq("user_id", payload.userId)
          .single()

        if (ingredientError) {
          return NextResponse.json({ message: "食材が見つかりません" }, { status: 400 })
        }
      }

      const { data: oldDish, error: oldError } = await supabase
        .from("dishes")
        .select("id, dish_ingredients(ingredient_id, quantity)")
        .eq("id", params.id)
        .eq("user_id", payload.userId)
        .single()

      if (oldError) {
        return NextResponse.json({ message: "商品が見つかりません" }, { status: 404 })
      }

      const { error } = await supabase
        .from("dishes")
        .update({
          name: result.data.name,
          selling_price: result.data.sellingPrice
        })
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      await supabase
        .from("dish_ingredients")
        .delete()
        .eq("dish_id", params.id)
      const items = result.data.rows.map((row) => ({
        dish_id: Number(params.id),
        ingredient_id: row.ingredientId,
        quantity: row.quantity
      }))
      const { error: itemError } = await supabase
        .from("dish_ingredients")
        .insert(items)
      if (itemError) {
        await supabase.from("dish_ingredients").insert(
          oldDish.dish_ingredients.map((old) => ({
            dish_id: Number(params.id),
            ingredient_id: old.ingredient_id,
            quantity: old.quantity
          }))
        )
        throw new Error(itemError.message)
      }
      return NextResponse.json({ message: "商品編集成功" }, { status: 200 })
    } catch (error) {
      console.log(error)
      if (error.message.includes("duplicate key")) {
        return NextResponse.json({ message: "同じ名前の商品が既に登録されています" }, { status: 400 })
      }
      return NextResponse.json({ message: "商品編集に失敗しました" }, { status: 500 })
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
      const { error } = await supabase
        .from("dishes")
        .delete()
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      return NextResponse.json({ message: "商品削除成功" }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "商品削除失敗"}, { status: 500 })
    }
  }
}
