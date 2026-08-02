"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"
import calcDishCost, { calcItemCost } from "@/app/utils/calcCost"

const UpdateDish = (context) => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [dishIngredients, setDishIngredients] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [rows, setRows] = useState([])

  const router = useRouter()
  const loginUserEmail = useAuth()

  useEffect(() => {
    const getDish = async () => {
      const params = await context.params
      const response = await fetch(`/api/dishes/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      const singleItem = await jsonData.dish
      if (response.ok) {
        setName(singleItem.name)
        setSellingPrice(singleItem.selling_price)
        setDishIngredients(singleItem.dish_ingredients)
        setRows(singleItem.dish_ingredients.map((item) => ({
          ingredientId: String(item.ingredient_id),
          quantity: String(item.quantity),

        })))
      }
    }
    getDish()
  }, [context])

  useEffect(() => {
    const getIngredients = async () => {
      const response = await fetch("/api/ingredients", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      if (response.ok) {
        setIngredients(jsonData.ingredients)
      } else {
        alert(jsonData.message)
      }
    }
    getIngredients()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const params = await context.params
      const response = await fetch(`/api/dishes/${params.id}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: name,
          sellingPrice: sellingPrice,
          rows: rows
        })
      })
      const jsonData = await response.json()
      alert(jsonData.message)
      if (response.ok) {
        router.push("/dishes")
      }
    } catch {
      alert("商品編集に失敗しました")
    }
  }

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか?")) return
    try {
      const params = await context.params
      const response = await fetch(`/api/dishes/${params.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      alert(jsonData.message)
      if (response.ok) {
        router.push("/dishes")
      }
    } catch {
      alert("商品削除に失敗しました")
    }
  }

  const changeIngredient = (index, value) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], ingredientId: value }
    setRows(newRows)
  }

  const changeQuantity = (index, value) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], quantity: value }
    setRows(newRows)
  }

  const addRow = () => {
    setRows([...rows, { ingredientId: "", quantity: "" }])
  }

  const deleteRow = (index) => {
    const newRows = rows.filter((row, i) => i !== index)
    setRows(newRows)
  }

  const previewItems = rows
    .filter((row) => row.ingredientId && row.quantity)
    .map((row) => {
      const ingredient = ingredients.find((ing) => ing.id === Number(row.ingredientId))
      return { quantity: Number(row.quantity), ingredients: ingredient }
    })
    .filter((item) => item.ingredients)

  if (loginUserEmail) {
    return (
      <div>
        <h1>商品編集ページ</h1>
        <form onSubmit={handleSubmit}>
          商品名：<input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="商品名(例：唐揚げ)" required />
          販売価格：<input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" placeholder="販売価格（例：1000）" required />円
          <h2>使っている食材</h2>
          {rows.map((row, index) => (
            <div key={index}>
              <select
                value={row.ingredientId}
                onChange={(e) => changeIngredient(index, e.target.value)}
                required
              >
                <option value="">食材を選択</option>
                {ingredients.map((ingredient) => (
                  <option value={ingredient.id} key={ingredient.id}>
                    {ingredient.name}({ingredient.unit})
                  </option>
                ))}
              </select>
              <input
                value={row.quantity}
                onChange={(e) => changeQuantity(index, e.target.value)}
                placeholder="使用量"
                type="number"
              />
              {rows.length > 1 && (
                <button type="button" onClick={() => deleteRow(index)}>- 削除</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addRow}>+ 食材を追加</button>
          <button>更新</button>
          <button type="button" onClick={handleDelete}>削除</button>
        </form>
        <p>原価合計:{Math.round(calcDishCost(previewItems))}円</p>
        {sellingPrice && (
          <p>原価率:{Math.round(calcDishCost(previewItems) / Number(sellingPrice) * 100)}%</p>
        )}
      </div>
    )
  }
}

export default UpdateDish
