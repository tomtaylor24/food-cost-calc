"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "@/app/utils/useAuth"

const DeleteItem = (context) => {
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
      const response = await fetch(`/api/item/delete/${params.id}`,{
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          email: loginUserEmail
        })
      })
      const jsonData = await response.json()
      alert(jsonData.message)
      router.push("/")
    }catch{
      alert("食材削除失敗")
    }

  }

  if(loginUserEmail === email){
    return(
      <div>
        <h1>食材削除ページ</h1>
        <form onSubmit={handleSubmit}>
          <h1>{title}</h1>
          <h2>{number}</h2>
          <h2>{cost}</h2>
          <button>食材削除</button>
        </form>
      </div>
    )
  }else{
    return(
      <h1>権限がありません</h1>
    )
  }
}

export default DeleteItem
