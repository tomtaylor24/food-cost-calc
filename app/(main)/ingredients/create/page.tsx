"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuth from "@/app/utils/useAuth"
import styles from "./page.module.scss"
import toast from "react-hot-toast"
import Combobox from "@/app/components/combobox"
import { UNIT_OPTIONS } from "@/app/utils/units"
import { SubmitEvent } from "react"

const CreateIngredients = () => {
  const [name, setName] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseQuantity, setPurchaseQuantity] = useState("")
  const [unit, setUnit] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const loginUserEmail = useAuth()

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
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
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/ingredients")
      } else {
        toast.error(jsonData.message)
        setIsSubmitting(false)
      }
    } catch {
      toast.error("通信に失敗しました")
      setIsSubmitting(false)
    }
  }
  if (!loginUserEmail) return null
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
          <dt><label htmlFor="ingredient-name">食材名</label></dt>
          <dd>
            <input id="ingredient-name" className="formInput" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="例：鶏もも肉" required />
          </dd>
        </dl>

        <div className={styles.formRow}>
          <dl>
            <dt><label htmlFor="purchase-price">仕入れ値</label></dt>
            <dd>
              <div className="formField">
                <span>￥</span>
                <input id="purchase-price" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} type="number" placeholder="880" required />
              </div>
            </dd>
          </dl>
          <dl>
            <dt><label htmlFor="purchase-quantity">仕入れ量</label></dt>
            <dd className={styles.quantity}>
              <input id="purchase-quantity" className="formInput" value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(e.target.value)} type="number" placeholder="1000" required />
              <Combobox
                options={UNIT_OPTIONS}
                value={unit}
                onChange={setUnit}
                placeholder="単位"
                allowFreeInput
                maxLength={10}
                ariaLabel="単位"
                required
              />

            </dd>
          </dl>
        </div>

        <div className="formBtns">
          <button className="btn formSubmit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <span className="btnSpinner" aria-hidden="true" />}食材を登録
          </button>
          <Link href="/ingredients" className="formCancel pc">キャンセル</Link>
        </div>
      </form>
    </div>
  )
}

export default CreateIngredients
