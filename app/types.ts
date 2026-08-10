export type Dish = {
  id: number,
  user_id: string,
  name: string,
  selling_price: number | null,
  created_at: string
}

export type DishWithCost = Dish & {
  totalCost: number
}

export type Ingredient = {
  id: number,
  user_id: string,
  name: string,
  purchase_price: number,
  purchase_quantity: number,
  unit: string,
  created_at: string
}

export type RecipeRow = {
  ingredientId: string
  quantity: string
}

export type DishDetail = Dish & {
  dish_ingredients: {
    id: number
    ingredient_id: number
    quantity: number
    ingredients: {
      name: string
      unit: string
      purchase_price: number
      purchase_quantity: number
    }
  }[]
}
