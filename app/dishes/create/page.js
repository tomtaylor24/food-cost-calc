"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"

const CreateDishes = () => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [ingredients, setIngredients] = useState([])
  const [rows, setRows] = useState([
    { ingredientId: "", quantity: "" }
  ])

  const router = useRouter()
  const loginUserEmail = useAuth()

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
      const response = await fetch("/api/dishes", {
        method: "POST",
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
      alert("商品登録に失敗しました")
    }
  }

  const changeIngredient = (index, value) => {
    const newRows = [...rows]
    newRows[index] = {...newRows[index], ingredientId: value}
    setRows(newRows)
  }

  const changeQuantity = (index, value) => {
    const newRows = [...rows]
    newRows[index] = {...newRows[index], quantity: value}
    setRows(newRows)
  }

  const addRow = () => {
    setRows([...rows, {ingredientId: "", quantity: ""}])
  }

  const deleteRow = (index) => {
    const newRows = rows.filter((row, i) => i !== index)
    setRows(newRows)
  }

  if (loginUserEmail) {
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="商品名（例：唐揚げ）" required />
          <input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" placeholder="販売価格（例：800円）" required />円
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
          <button>商品登録</button>
        </form>
      </div>
    )
  }
}

export default CreateDishes
