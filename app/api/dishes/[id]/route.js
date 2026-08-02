import { NextResponse } from "next/server"
import supabase from "@/app/utils/database"
import verifyToken from "@/app/utils/verifyToken"

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
      console.log(JSON.stringify(data, null, 2))
      return NextResponse.json({
        message: "商品詳細取得成功",
        dish: data
      }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ message: `商品詳細取得失敗: ${error.message}` }, { status: 404 })
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

      for (const row of reqBody.rows) {
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
          name: reqBody.name,
          selling_price: Number(reqBody.sellingPrice)
        })
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      await supabase
        .from("dish_ingredients")
        .delete()
        .eq("dish_id", params.id)
      const items = reqBody.rows.map((row) => ({
        dish_id: Number(params.id),
        ingredient_id: Number(row.ingredientId),
        quantity: Number(row.quantity)
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
      return NextResponse.json({ message: `商品編集失敗: ${error.message}` }, { status: 500 })
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
      return NextResponse.json({ message: `商品削除失敗: ${error.message}` }, { status: 500 })
    }
  }
}
