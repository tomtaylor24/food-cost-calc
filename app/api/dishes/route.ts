import { NextResponse } from "next/server"
import supabase from "@/app/utils/database"
import verifyToken from "@/app/utils/verifyToken"
import calcDishCost from "@/app/utils/calcCost"
import { dishSchema } from "@/app/utils/schemas"
import readJson from "@/app/utils/readJson"
import type { DishListRow } from "@/app/types"
import { DbError, isUniqueViolation } from "@/app/utils/dbError"

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
      const result = dishSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
      }
      for (const row of result.data.rows) {
        const { error: ingredientError } = await supabase
          .from("ingredients")
          .select("id")
          .eq("id", row.ingredientId)
          .eq("user_id", payload.userId)
          .single()

        if (ingredientError) {
          return NextResponse.json({ message: "食材が見つかりません" }, { status: 400 })
        }
      }

      if (result.data.categoryId) {
        const { error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("id", result.data.categoryId)
          .eq("user_id", payload.userId)
          .single()

        if (categoryError) {
          return NextResponse.json({ message: "カテゴリーが見つかりません" }, { status: 400 })
        }
      }

      const { data, error } = await supabase
        .from("dishes")
        .insert({
          user_id: payload.userId,
          name: result.data.name,
          selling_price: result.data.sellingPrice,
          category_id: result.data.categoryId ?? null
        })
        .select()
        .single()

      if (error) throw new DbError(error)

      const inserted = data as { id: number }

      const items = result.data.rows.map((row) => ({
        dish_id: inserted.id,
        ingredient_id: row.ingredientId,
        quantity: row.quantity
      }))

      const { error: itemError } = await supabase
        .from("dish_ingredients")
        .insert(items)
      if (itemError) {
        await supabase.from("dishes").delete().eq("id", inserted.id)
        throw new DbError(itemError)
      }
      return NextResponse.json({ message: "商品登録成功" }, { status: 201 })
    } catch (error) {
      console.log(error)
      if (isUniqueViolation(error, "dish_ingredients")) {
        return NextResponse.json({ message: "同じ食材が複数の行で選ばれています" }, { status: 400 })
      }
      if (isUniqueViolation(error)) {
        return NextResponse.json({ message: "同じ名前の商品が既に登録されています" }, { status: 400 })
      }
      return NextResponse.json({ message: "商品登録に失敗しました" }, { status: 500 })
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
        .from("dishes")
        .select("*, categories(id, name), dish_ingredients(quantity, ingredients(purchase_price, purchase_quantity))")
        .eq("user_id", payload.userId)
        .order("created_at", { ascending: false })
      if (error) throw new DbError(error)
      const rows = data as DishListRow[]
      const dishesWithCost = rows.map((dish) => {
        const cost = calcDishCost(dish.dish_ingredients)
        return { ...dish, totalCost: cost }
      })
      return NextResponse.json({
        message: "商品一覧の取得成功",
        dishes: dishesWithCost
      }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "商品一覧の取得に失敗しました" }, { status: 500 })
    }
  }
}
