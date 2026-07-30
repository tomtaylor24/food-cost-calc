"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"

const UpdateIngredient = (context) => {
  const [name, setName] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseQuantity, setPurchaseQuantity] = useState("")
  const [unit, setUnit] = useState("")

  const router = useRouter()
  const loginUserEmail = useAuth()


  useEffect(() => {
    const getIngredient = async () => {
      const params = await context.params
      const response = await fetch(`/api/ingredients/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      const singleItem = await jsonData.ingredient
      if (response.ok) {
        setName(singleItem.name)
        setPurchasePrice(singleItem.purchase_price)
        setPurchaseQuantity(singleItem.purchase_quantity)
        setUnit(singleItem.unit)
      }
    }
    getIngredient()
  }, [context])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const params = await context.params
      const response = await fetch(`/api/ingredients/${params.id}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: name,
          purchasePrice: purchasePrice,
          purchaseQuantity: purchaseQuantity,
          unit: unit
        })
      })
      const jsonData = await response.json()
      alert(jsonData.message)
      if (response.ok) {
        router.push("/ingredients")
      }
    } catch {
      alert("食材編集に失敗しました")
    }
  }

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか?")) return
    try {
      const params = await context.params
      const response = await fetch(`/api/ingredients/${params.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      alert(jsonData.message)
      if (response.ok) {
        router.push("/ingredients")
      }
    } catch {
      alert("食材削除に失敗しました")
    }
  }

  if (loginUserEmail) {
    return (
      <div>
        <h1>食材編集ページ</h1>
        <form onSubmit={handleSubmit}>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="食材名(例：鶏もも肉)" required />
          <input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} type="number" placeholder="仕入れ値(例：1,000)" required />円
          <input value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(e.target.value)} type="number" placeholder="仕入れ量(例：1,000)" required />
          <select value={unit} onChange={(e) => setUnit(e.target.value)} required>
            <option value="">単位を選択</option>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="個">個</option>
          </select>
          <button>更新</button>
          <button type="button" onClick={handleDelete}>削除</button>
        </form>
      </div>
    )
  }
}

export default UpdateIngredient
