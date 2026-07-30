"use client"
import { useState, useEffect } from "react"
import useAuth from "@/app/utils/useAuth"
import Link from "next/link"

const IngredientsList = () => {
  const [ingredients, setIngredientsList] = useState([])
  const loginUserEmail = useAuth()

  useEffect(() => {
    const getIngredients = async () => {
      const response = await fetch("/api/ingredients", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      if (response.ok){
        setIngredientsList(jsonData.ingredients)
      }else{
        alert(jsonData.message)
      }
    }
    getIngredients()
  }, [])
  if(loginUserEmail){
    return (
      <div>
      <Link href="/ingredients/create">新しい食材を登録</Link>
      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            <Link href={`/ingredients/${ingredient.id}`}>
              {ingredient.name} {ingredient.purchase_price}円 / {ingredient.purchase_quantity}{ingredient.unit}
            </Link>
          </li>
        ))}
      </ul>
      </div>
    )
  }
}

export default IngredientsList
