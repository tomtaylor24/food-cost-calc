import { NextResponse } from "next/server"
import supabase from "@/app/utils/database"
import verifyToken from "@/app/utils/verifyToken"
import calcDishCost from "@/app/utils/calcCost"

export async function POST(request) {
  const reqBody = await request.json()
  const payload = await verifyToken(request)

  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
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

      const { data, error } = await supabase
        .from("dishes")
        .insert({
          user_id: payload.userId,
          name: result.data.name,
          selling_price: result.data.sellingPrice
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      const items = result.data.rows.map((row) => ({
        dish_id: data.id,
        ingredient_id: Number(row.ingredientId),
        quantity: Number(row.quantity)
      }))

      const { error: itemError } = await supabase
        .from("dish_ingredients")
        .insert(items)
      if (itemError) {
        await supabase.from("dishes").delete().eq("id", data.id)
        throw new Error(itemError.message)
      }
      return NextResponse.json({ message: "商品登録成功" }, { status: 201 })
    } catch (error) {
      if (error.message.includes("duplicate key")) {
        return NextResponse.json({ message: "同じ名前の商品が既に登録されています" }, { status: 400 })
      }
      return NextResponse.json({ message: "商品登録に失敗しました" }, { status: 500 })
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
        .select("*, dish_ingredients(quantity, ingredients(purchase_price, purchase_quantity))")
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      const dishesWithCost = data.map((dish) => {
        const cost = calcDishCost(dish.dish_ingredients)
        return { ...dish, totalCost: cost }
      })
      return NextResponse.json({
        message: "商品一覧の取得成功",
        dishes: dishesWithCost
      }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: 商品一覧の取得失敗}, { status: 500 })
    }
  }
}
