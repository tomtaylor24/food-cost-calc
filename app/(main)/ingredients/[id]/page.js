"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuth from "@/app/utils/useAuth"
import styles from "./page.module.scss"
import toast from "react-hot-toast"


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
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/ingredients")
      }else{
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("食材編集に失敗しました")
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
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/ingredients")
      }else{
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("食材削除に失敗しました")
    }
  }

  const unitPrice = Number(purchaseQuantity) ? Number(purchasePrice) / Number(purchaseQuantity) : null

  if (loginUserEmail) {
    return (
      <div className="container">
        <div className="breadcrumb">
          <Link href="/ingredients">食材一覧</Link>
          <span className="pc">／</span>
          <span className="pc">{name}</span>
        </div>
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">{name}</h1>
          </div>
          <div className="pageActions">
            <button form="ingredientForm" className="btn formSubmit">変更を保存</button>
            <button className="formDelete" type="button" onClick={handleDelete}>食材を削除</button>
          </div>
        </div>

        <form id="ingredientForm" className={`form ${styles.form}`} onSubmit={handleSubmit}>
          <dl>
            <dt>食材名</dt>
            <dd>
              <input className="formInput" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="例：鶏もも肉" required />
            </dd>
          </dl>

          <div className={styles.formRow}>
            <dl>
              <dt>仕入れ値</dt>
              <dd>
                <div className="formField">
                  <span>￥</span>
                  <input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} type="number" placeholder="880" required />
                </div>
              </dd>
            </dl>
            <dl>
              <dt>仕入れ量</dt>
              <dd className={styles.quantity}>
                <input className="formInput" value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(e.target.value)} type="number" placeholder="1000" required />
                <select className="formSelect" value={unit} onChange={(e) => setUnit(e.target.value)} required>
                  <option value="">単位</option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="個">個</option>
                </select>
              </dd>
            </dl>
          </div>

          {unitPrice !== null && unit && (
            <p className={styles.unitPrice}>単価換算<span>￥{unitPrice.toFixed(2)} / {unit}</span></p>
          )}
        </form>
      </div>
    )
  }
}

export default UpdateIngredient
