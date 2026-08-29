export type UnitPriceInput = {
  purchase_price: number,
  purchase_quantity: number,
  yield_rate: number,
  tax_add_rate: number
}

export const calcUnitPrice = (ingredient: UnitPriceInput) => {
  const taxedPrice = ingredient.purchase_price * (1 + ingredient.tax_add_rate / 100)
  const usableQuantity = ingredient.purchase_quantity * (ingredient.yield_rate / 100)
  return taxedPrice / usableQuantity
}

type DishIngredientRow = {
  quantity: number,
  ingredients: UnitPriceInput
}

const calcItemCost = (item: DishIngredientRow) => {
  return calcUnitPrice(item.ingredients) * item.quantity
}

const calcDishCost = (items: DishIngredientRow[]) => {
  return items.reduce((sum, item) => {
    return sum + calcItemCost(item)
  }, 0)
}

export default calcDishCost
