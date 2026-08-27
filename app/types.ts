export type Dish = {
  id: number,
  user_id: string,
  name: string,
  selling_price: number | null,
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
  purchase_price: number,
  purchase_quantity: number,
  unit: string,
  created_at: string
}

export type IngredientDetail = Ingredient & {
  dish_ingredients: {
    count: number
  }[]
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
