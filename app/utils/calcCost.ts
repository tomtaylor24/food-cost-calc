type DishIngredientRow = {
  quantity: number,
  ingredients: {
    purchase_price: number,
    purchase_quantity: number
  }
}

export const calcItemCost = (item: DishIngredientRow) => {
  return (item.ingredients.purchase_price / item.ingredients.purchase_quantity) * item.quantity
}

const calcDishCost = (items: DishIngredientRow[]) => {
  return items.reduce((sum, item) => {
    return sum + calcItemCost(item)
  }, 0)
}

export default calcDishCost
