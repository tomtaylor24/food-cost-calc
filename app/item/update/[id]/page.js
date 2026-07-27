"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"

const UpdateItem = (context) => {
  const [title, setTitle] = useState("")
  const [number, setNumber] = useState("")
  const [cost, setCost] = useState("")
  const [email, setEmail] = useState("")

  const router = useRouter()
  const loginUserEmail = useAuth()

  useEffect(() => {
    const getSingleItem = async() => {
    const params = await context.params
    const response = await fetch(`/api/item/readsingle/${params.id}`)
    const jsonData = await response.json()
    const singleItem = jsonData.singleItem
    setTitle(singleItem.title)
    setNumber(singleItem.number)
    setCost(singleItem.cost)
    setEmail(singleItem.email)
    }
    getSingleItem()
  }, [context])

  const handleSubmit = async(e) => {
    e.preventDefault()
    try{
      const params = await context.params
      const response = await fetch(`/api/item/update/${params.id}`,{
        method: "PUT",
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
      alert("食材編集失敗")
    }

  }

  if(loginUserEmail === email){
    return(
      <div>
        <h1>食材編集ページ</h1>
        <form onSubmit={handleSubmit}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="食材名" required/>
          <input value={number} onChange={(e) => setNumber(e.target.value)} type="text" placeholder="数量" required/>
          <input value={cost} onChange={(e) => setCost(e.target.value)} type="text" placeholder="仕入れ値" required/>
          <button>食材編集</button>
        </form>
      </div>
    )
  }else{
    return(
      <h1>権限がありません</h1>
    )
  }
}

export default UpdateItem
