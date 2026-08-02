"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"
import calcDishCost, { calcItemCost } from "@/app/utils/calcCost"

const UpdateDish = (context) => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [dishIngredients, setDishIngredients] = useState([])

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
      }
    }
    getDish()
  }, [context])

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
          sellingPrice: sellingPrice
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

  if (loginUserEmail) {
    return (
      <div>
        <h1>商品編集ページ</h1>
        <form onSubmit={handleSubmit}>
          商品名：<input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="商品名(例：唐揚げ)" required />
          販売価格：<input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" placeholder="販売価格（例：1000）" required />円
          <button>更新</button>
          <button type="button" onClick={handleDelete}>削除</button>
        </form>
        <h2>使っている食材</h2>
        <ul>
          {dishIngredients.map((item) => (
            <li key={item.id}>
              {item.ingredients.name} / 使用量：{item.quantity}{item.ingredients.unit} / 原価：{Math.round(calcItemCost(item))}円
            </li>
          ))}
        </ul>
        <p>原価合計:{Math.round(calcDishCost(dishIngredients))}円</p>
        {sellingPrice && (
          <p>原価率:{Math.round(calcDishCost(dishIngredients) / Number(sellingPrice) * 100)}%</p>
        )}
      </div>
    )
  }
}

export default UpdateDish
