export const calcItemCost = (item) => {
  return (item.ingredients.purchase_price / item.ingredients.purchase_quantity) * item.quantity
}

const calcDishCost = (items) => {
  return items.reduce((sum, item) => {
    return sum + calcItemCost(item)
  }, 0)
}

export default calcDishCost
