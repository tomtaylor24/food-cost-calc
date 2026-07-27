"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"

const CreateItem = () => {
  const [title, setTitle] = useState("")
  const [number, setNumber] = useState("")
  const [cost, setCost] = useState("")

  const router = useRouter()
  const loginUserEmail = useAuth()

  const handleSubmit = async(e) => {
    e.preventDefault()
    try{
      const response = await fetch("/api/item/create",{
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: title,
          number: number,
          cost: cost,
          email: loginUserEmail
        })
      })
      const jsonData = await response.json()
      alert(jsonData.message)
      router.push("/")
    }catch{
      alert("食材登録失敗")
    }

  }

  if(loginUserEmail){
    return(
      <div>
        <h1>食材登録ページ</h1>
        <form onSubmit={handleSubmit}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="食材名" required/>
          <input value={number} onChange={(e) => setNumber(e.target.value)} type="text" placeholder="数量" required/>
          <input value={cost} onChange={(e) => setCost(e.target.value)} type="text" placeholder="仕入れ値" required/>
          <button>食材登録</button>
        </form>
      </div>
    )
  }
}

export default CreateItem
