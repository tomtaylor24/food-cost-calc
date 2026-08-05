"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuth from "@/app/utils/useAuth"
import styles from "./page.module.scss"
import toast from "react-hot-toast"

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
      if(response.ok){
        toast.success(jsonData.message)
        router.push("/ingredients")
      } else{
        toast.error("食材登録に失敗しました")
      }
    } catch {
      toast.error("食材登録に失敗しました")
    }
  }
  if(loginUserEmail){
    return (
      <div className="container">
        <div className="breadcrumb">
          <Link href="/ingredients">食材一覧</Link>
          <span className="pc">／</span>
          <span className="pc">新しい食材を登録</span>
        </div>
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">新しい食材を登録</h1>
          </div>
        </div>
        <form className={`form ${styles.form}`} onSubmit={handleSubmit}>
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

          <div className="formBtns">
            <button className="btn formSubmit">食材を登録</button>
            <Link href="/ingredients" className="formCancel pc">キャンセル</Link>
          </div>
        </form>
      </div>
    )
  }
}

export default CreateIngredients
