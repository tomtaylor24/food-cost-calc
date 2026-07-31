"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"

const CreateDishes = () => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")

  const router = useRouter()
  const loginUserEmail = useAuth()

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
          sellingPrice: sellingPrice
        })
      })
      const jsonData = await response.json()
      alert(jsonData.message)
      if(response.ok){
        router.push("/dishes")
      }
    } catch {
      alert("商品登録に失敗しました")
    }
  }
  if(loginUserEmail){
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="商品名（例：唐揚げ）" required/>
          <input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" placeholder="販売価格（例：800円）" required/>円
          <button>商品登録</button>
        </form>
      </div>
    )
  }
}

export default CreateDishes
