export type Dish = {
  id: number,
  user_id: string,
  name: string,
  selling_price: number | null,
  category_id: number | null,
  created_at: string
}

export type DishWithCost = Dish & {
  totalCost: number,
  categories: {
    id: number,
    name: string
  } | null
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
  categories: { id: number, name: string } | null
  dish_ingredients: {
    quantity: number
    ingredients: {
      purchase_price: number
      purchase_quantity: number
    }
  }[]
}

export type OldDishRow = {
  id: number
  dish_ingredients: {
    ingredient_id: number
    quantity: number
  }[]
}
