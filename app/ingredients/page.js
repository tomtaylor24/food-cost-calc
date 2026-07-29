"use client"
import { useState, useEffect } from "react"
import useAuth from "@/app/utils/useAuth"

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
      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            {ingredient.name} {ingredient.purchase_price}円 / {ingredient.purchase_quantity}{ingredient.unit}
          </li>
        ))}
      </ul>
    )
  }
}

export default IngredientsList
