"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuth from "@/app/utils/useAuth"
import styles from "./page.module.scss"
import toast from "react-hot-toast"
import Combobox from "@/app/components/combobox"
import { UNIT_OPTIONS } from "@/app/utils/units"
import { Ingredient } from "@/app/types"
import { SubmitEvent } from "react"

type Props = {
  params: Promise<{ id: string }>
}

const UpdateIngredient = (context: Props) => {
  const [name, setName] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseQuantity, setPurchaseQuantity] = useState("")
  const [unit, setUnit] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const loginUserEmail = useAuth()


  useEffect(() => {
    const getIngredient = async () => {
      try {
        const params = await context.params
        const response = await fetch(`/api/ingredients/${params.id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
        const jsonData = await response.json()
        const singleItem = jsonData.ingredient as Ingredient
        if (response.ok) {
          setName(singleItem.name)
          setPurchasePrice(String(singleItem.purchase_price))
          setPurchaseQuantity(String(singleItem.purchase_quantity))
          setUnit(singleItem.unit)
        } else {
          toast.error(jsonData.message)
          router.push("/ingredients")
        }
      } catch {
        toast.error("通信に失敗しました")
      }
    }
    getIngredient()
  }, [context, router])

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
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
      } else {
        toast.error(jsonData.message)
        setIsSubmitting(false)
      }
    } catch {
      toast.error("食材編集に失敗しました")
      setIsSubmitting(false)
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
      } else {
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
            <button form="ingredientForm" className="btn formSubmit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting && <span className="btnSpinner" aria-hidden="true" />}変更を保存
            </button>
            <button className="formDelete" type="button" onClick={handleDelete} disabled={isSubmitting}>食材を削除</button>
          </div>
        </div>

        <form id="ingredientForm" className={`form ${styles.form}`} onSubmit={handleSubmit}>
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

          {unitPrice !== null && unit && (
            <p className={styles.unitPrice}>単価換算<span>￥{unitPrice.toFixed(2)} / {unit}</span></p>
          )}
        </form>
      </div>
    )
  }
}

export default UpdateIngredient
