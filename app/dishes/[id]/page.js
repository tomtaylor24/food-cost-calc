"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"

const UpdateDish = (context) => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")

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
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="商品名(例：唐揚げ)" required />
          <input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" placeholder="販売価格（例：1000）" required />円
          <button>更新</button>
          <button type="button" onClick={handleDelete}>削除</button>
        </form>
      </div>
    )
  }
}

export default UpdateDish
