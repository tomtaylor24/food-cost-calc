"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"

const CreateIngredients = () => {
  const [name, setName] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseQuantity, setPurchaseQuantity] = useState("")
  const [unit, setUnit] = useState("")

  const router = useRouter()
  const loginUserEmail = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
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
      if(response.ok){
        router.push("/ingredients")
      }
    } catch {
      alert("食材登録に失敗しました")
    }
  }
  if(loginUserEmail){
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="食材名(例：鶏もも肉)" required/>
          <input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} type="number" placeholder="仕入れ値(例：1,000)" required/>円
          <input value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(e.target.value)} type="number" placeholder="仕入れ量(例：1,000)" required/>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} required>
            <option value="">単位を選択</option>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="個">個</option>
          </select>
          <button>食材登録</button>
        </form>
      </div>
    )
  }
}

export default CreateIngredients
