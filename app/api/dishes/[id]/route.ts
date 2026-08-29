import { NextResponse } from "next/server"
import supabase from "@/app/utils/database"
import verifyToken from "@/app/utils/verifyToken"
import { dishSchema } from "@/app/utils/schemas"
import readJson from "@/app/utils/readJson"
import type { OldDishRow } from "@/app/types"
import { DbError, isUniqueViolation, isNotFound } from "@/app/utils/dbError"

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: Context) {
  const payload = await verifyToken(request)

  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const params = await context.params
      const { data, error } = await supabase
        .from("dishes")
        .select("*, dish_categories(category_id), dish_ingredients(id, ingredient_id, quantity, ingredients(name, unit, purchase_price, purchase_quantity, yield_rate, tax_add_rate))")
        .eq("id", params.id)
        .eq("user_id", payload.userId)
        .single()
      if (error) throw new DbError(error)
      return NextResponse.json({
        message: "商品詳細取得成功",
        dish: data
      }, { status: 200 })
    } catch (error) {
      console.log(error)
      if (isNotFound(error)) {
        return NextResponse.json({ message: "商品が見つかりません" }, { status: 404 })
      }
      return NextResponse.json({ message: "商品の取得に失敗しました" }, { status: 500 })
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

      for (const categoryId of result.data.categoryIds) {
        const { error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("id", categoryId)
          .eq("user_id", payload.userId)
          .single()

        if (categoryError) {
          return NextResponse.json({ message: "カテゴリーが見つかりません" }, { status: 400 })
        }
      }

      const { data: oldDish, error: oldError } = await supabase
        .from("dishes")
        .select("id, dish_ingredients(ingredient_id, quantity), dish_categories(category_id)")
        .eq("id", params.id)
        .eq("user_id", payload.userId)
        .single()

      if (oldError) {
        return NextResponse.json({ message: "商品が見つかりません" }, { status: 404 })
      }

      const previousDish = oldDish as OldDishRow

      const { error } = await supabase
        .from("dishes")
        .update({
          name: result.data.name,
          selling_price: result.data.sellingPrice,
          note: result.data.note
        })
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new DbError(error)
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
        await supabase
        .from("dish_ingredients")
        .insert(
          previousDish.dish_ingredients.map((old) => ({
            dish_id: Number(params.id),
            ingredient_id: old.ingredient_id,
            quantity: old.quantity
          }))
        )
        throw new DbError(itemError)
      }

      await supabase
        .from("dish_categories")
        .delete()
        .eq("dish_id", params.id)
      if (result.data.categoryIds.length > 0) {
        const categoryRows = result.data.categoryIds.map((categoryId) => ({
          dish_id: Number(params.id),
          category_id: categoryId
        }))
        const { error: categoryInsertError } = await supabase
          .from("dish_categories")
          .insert(categoryRows)
        if (categoryInsertError) {
          if (previousDish.dish_categories.length > 0) {
            await supabase.from("dish_categories").insert(
              previousDish.dish_categories.map((old) => ({
                dish_id: Number(params.id),
                category_id: old.category_id
              }))
            )
          }
          throw new DbError(categoryInsertError)
        }
      }
      return NextResponse.json({ message: "商品編集成功" }, { status: 200 })
    } catch (error) {
      console.log(error)
      if (isUniqueViolation(error, "dish_ingredients")) {
        return NextResponse.json({ message: "同じ食材が複数の行で選ばれています" }, { status: 400 })
      }
      if (isUniqueViolation(error, "dish_categories")) {
        return NextResponse.json({ message: "同じカテゴリーが重複して選ばれています" }, { status: 400 })
      }
      if (isUniqueViolation(error)) {
        return NextResponse.json({ message: "同じ名前の商品が既に登録されています" }, { status: 400 })
      }
      return NextResponse.json({ message: "商品編集に失敗しました" }, { status: 500 })
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
      const { error } = await supabase
        .from("dishes")
        .delete()
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new DbError(error)
      return NextResponse.json({ message: "商品削除成功" }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "商品削除失敗" }, { status: 500 })
    }
  }
}
