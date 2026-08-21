import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import supabase from "@/app/utils/database"
import { issueToken } from "@/app/utils/jwt"
import { DbError } from "@/app/utils/dbError"
import { DEMO_CATEGORIES, DEMO_INGREDIENTS, DEMO_DISHES } from "@/app/utils/demoData"
import type { User } from "@/app/types"

const DEMO_LIFETIME_HOURS = 24

type NamedRow = {
  id: number
  name: string
}

const toIdByName = (rows: NamedRow[]) => {
  const idByName: Record<string, number> = {}
  for (const row of rows) {
    idByName[row.name] = row.id
  }
  return idByName
}

export async function POST() {
  let createdUserId: string | null = null

  try {
    const expiredAt = new Date(Date.now() - DEMO_LIFETIME_HOURS * 60 * 60 * 1000).toISOString()
    const { error: cleanupError } = await supabase
      .from("users")
      .delete()
      .eq("is_demo", true)
      .lt("created_at", expiredAt)
    if (cleanupError) console.log(cleanupError)

    const email = `demo-${crypto.randomUUID()}@example.invalid`
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10)

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({ email: email, password_hash: passwordHash, is_demo: true })
      .select()
      .single()
    if (userError) throw new DbError(userError)

    const user = userData as User
    createdUserId = user.id
    
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .insert(DEMO_CATEGORIES.map((name) => ({ user_id: user.id, name: name })))
      .select("id, name")
    if (categoryError) throw new DbError(categoryError)
    const categoryIdByName = toIdByName(categoryData as NamedRow[])

    const { data: ingredientData, error: ingredientError } = await supabase
      .from("ingredients")
      .insert(DEMO_INGREDIENTS.map((ingredient) => ({ user_id: user.id, ...ingredient })))
      .select("id, name")
    if (ingredientError) throw new DbError(ingredientError)
    const ingredientIdByName = toIdByName(ingredientData as NamedRow[])

    const { data: dishData, error: dishError } = await supabase
      .from("dishes")
      .insert(DEMO_DISHES.map((dish) => ({
        user_id: user.id,
        name: dish.name,
        selling_price: dish.selling_price
      })))
      .select("id, name")
    if (dishError) throw new DbError(dishError)
    const dishIdByName = toIdByName(dishData as NamedRow[])

    const dishCategories = DEMO_DISHES.flatMap((dish) => dish.categories.map((name) => ({
      dish_id: dishIdByName[dish.name],
      category_id: categoryIdByName[name]
    })))

    const { error: dishCategoryError } = await supabase.from("dish_categories").insert(dishCategories)
    if (dishCategoryError) throw new DbError(dishCategoryError)

    const items = DEMO_DISHES.flatMap((dish) => dish.items.map((item) => ({
      dish_id: dishIdByName[dish.name],
      ingredient_id: ingredientIdByName[item.ingredient],
      quantity: item.quantity
    })))

    const { error: itemError } = await supabase.from("dish_ingredients").insert(items)
    if (itemError) throw new DbError(itemError)

    const token = await issueToken(user.id, email)
    return NextResponse.json({ message: "デモアカウントを準備しました", token: token }, { status: 201 })
  } catch (error) {
    console.log(error)
    if (createdUserId !== null) {
      await supabase.from("users").delete().eq("id", createdUserId)
    }
    return NextResponse.json({ message: "デモの準備に失敗しました" }, { status: 500 })
  }
}
