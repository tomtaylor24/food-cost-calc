export type Dish = {
  id: number,
  user_id: string,
  name: string,
  selling_price: number | null,
  note: string | null,
  created_at: string
}

export type DishWithCost = Dish & {
  totalCost: number,
  categories: {
    id: number,
    name: string
  }[]
}

export type Ingredient = {
  id: number,
  user_id: string,
  name: string,
  name_kana: string | null,
  purchase_price: number,
  purchase_quantity: number,
  unit: string,
  yield_rate: number,
  tax_add_rate: number,
  supplier: string | null,
  note: string | null,
  created_at: string
}

export type PriceHistoryRow = {
  id: number
  purchase_price: number
  purchase_quantity: number
  yield_rate: number
  tax_add_rate: number
  changed_at: string
}

export type IngredientDetail = Ingredient & {
  dish_ingredients: {
    count: number
  }[]
  ingredient_price_history: PriceHistoryRow[]
}

export type RecipeRow = {
  id: string
  ingredientId: string
  quantity: string
}

export type DishDetail = Dish & {
  dish_categories: {
    category_id: number
  }[]
  dish_ingredients: {
    id: number
    ingredient_id: number
    quantity: number
    ingredients: {
      name: string
      unit: string
      purchase_price: number
      purchase_quantity: number
      yield_rate: number
      tax_add_rate: number
    }
  }[]
}

export type Category = {
  id: number
  user_id: string
  name: string
  created_at: string
}

export type User = {
  id: string
  email: string
  password_hash: string
  created_at: string
}

export type DishListRow = Dish & {
  dish_categories: {
    categories: { id: number, name: string }
  }[]
  dish_ingredients: {
    quantity: number
    ingredients: {
      purchase_price: number
      purchase_quantity: number
      yield_rate: number
      tax_add_rate: number
    }
  }[]
}

export type OldDishRow = {
  id: number
  dish_ingredients: {
    ingredient_id: number
    quantity: number
  }[]
  dish_categories: {
    category_id: number
  }[]
}
