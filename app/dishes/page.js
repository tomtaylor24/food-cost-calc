"use client"
import { useState, useEffect } from "react"
import useAuth from "@/app/utils/useAuth"
import Link from "next/link"

const DishesList = () => {
  const [dishes, setDishesList] = useState([])
  const loginUserEmail = useAuth()

  useEffect(() => {
    const getDishes = async () => {
      const response = await fetch("/api/dishes", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      if (response.ok){
        setDishesList(jsonData.dishes)
      }else{
        alert(jsonData.message)
      }
    }
    getDishes()
  }, [])
  if(loginUserEmail){
    return (
      <div>
      <Link href="/dishes/create">新しい商品を登録</Link>
      <ul>
        {dishes.map((dish) => (
          <li key={dish.id}>
            <Link href={`/dishes/${dish.id}`}>
              {dish.name} {dish.selling_price}円
            </Link>
          </li>
        ))}
      </ul>
      </div>
    )
  }
}

export default DishesList
