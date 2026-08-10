"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuth from "@/app/utils/useAuth"
import calcDishCost from "@/app/utils/calcCost"
import styles from "./page.module.scss"
import toast from "react-hot-toast"
import type { Dish, DishDetail, Ingredient } from "@/app/types"
import type { RecipeRow } from "@/app/types"
import { SubmitEvent } from "react"

type Props = {
  params: Promise<{ id: string }>
}

const UpdateDish = (context: Props) => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [rows, setRows] = useState<RecipeRow[]>([])

  const router = useRouter()
  const loginUserEmail = useAuth()

  useEffect(() => {
    const getDish = async () => {
      try{
        const params = await context.params
        const response = await fetch(`/api/dishes/${params.id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
        const jsonData = await response.json()
        const singleItem = jsonData.dish as DishDetail
        if (response.ok) {
          setName(singleItem.name)
          setSellingPrice(String(singleItem.selling_price ?? ""))
          setRows(singleItem.dish_ingredients.map((item) => ({
            ingredientId: String(item.ingredient_id),
            quantity: String(item.quantity),
          })))
        } else {
          toast.error(jsonData.message)
          router.push("/")
        }
      }catch{
        toast.error("通信に失敗しました")
      }
    }
    getDish()
  }, [context, router])

  useEffect(() => {
    const getIngredients = async () => {
      const response = await fetch("/api/ingredients", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      if (response.ok) {
        setIngredients(jsonData.ingredients)
      } else {
        toast.error(jsonData.message)
      }
    }
    getIngredients()
  }, [])

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const params = await context.params
      const response = await fetch(`/api/dishes/${params.id}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: name,
          sellingPrice: sellingPrice,
          rows: rows
        })
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/")
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("商品編集に失敗しました")
    }
  }

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか?")) return
    try {
      const params = await context.params
      const response = await fetch(`/api/dishes/${params.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/")
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("商品削除に失敗しました")
    }
  }

  const changeIngredient = (index: number, value: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], ingredientId: value }
    setRows(newRows)
  }

  const changeQuantity = (index: number, value: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], quantity: value }
    setRows(newRows)
  }

  const addRow = () => {
    setRows([...rows, { ingredientId: "", quantity: "" }])
  }

  const deleteRow = (index: number) => {
    const newRows = rows.filter((row, i) => i !== index)
    setRows(newRows)
  }

  const previewItems = rows
    .map((row) => {
      const ingredient = ingredients.find((ing) => ing.id === Number(row.ingredientId))
      if (!ingredient || !row.quantity) return null
      return { quantity: Number(row.quantity), ingredients: ingredient }
    })
    .filter((item) => item !== null)

  const totalCost = Math.round(calcDishCost(previewItems))
  const costRate = sellingPrice ? Math.round(totalCost / Number(sellingPrice) * 100) : null
  const isOverTarget = costRate !== null && costRate >= 30

  if (loginUserEmail) {
    return (
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">商品一覧</Link>
          <span className="pc">／</span>
          <span className="pc">{name}</span>
        </div>
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">{name}</h1>
          </div>
          <div className="pageActions">
            <button form="dishForm" className="btn formSubmit">変更を保存</button>
            <button className="formDelete" type="button" onClick={handleDelete}>商品を削除</button>
          </div>
        </div>

        <div className={styles.summary}>
          <dl>
            <dt>原価合計</dt>
            <dd>￥{totalCost.toLocaleString()}</dd>
          </dl>
          <dl>
            <dt>販売価格</dt>
            <dd>￥{Number(sellingPrice).toLocaleString()}</dd>
          </dl>
          <dl>
            <dt>原価率</dt>
            <dd>
              <span className={isOverTarget ? styles.high : undefined}>{costRate}%</span>
              {isOverTarget && <span className={`${styles.badge} pc`}>目標超過</span>}
            </dd>
          </dl>
        </div>
        {isOverTarget && <p className={`${styles.badgeBar} sp`}>目標の原価率を超えています</p>}

        <form id="dishForm" className={`form ${styles.form}`} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <dl>
              <dt>商品名</dt>
              <dd>
                <input className="formInput" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="例：唐揚げ定食" required />
              </dd>
            </dl>
            <dl>
              <dt>販売価格</dt>
              <dd>
                <div className="formField">
                  <span>￥</span>
                  <input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" placeholder="980" required />
                </div>
              </dd>
            </dl>
          </div>

          <div className={styles.rows}>
            <div className={`${styles.rowsHead} pc`}>
              <div>食材</div>
              <div>使用量</div>
              <div>単価</div>
            </div>
            <div className={`${styles.rowsLabel} sp`}>食材と使用量</div>
            {rows.map((row, index) => {
              const selected = ingredients.find((ingredient) => ingredient.id === Number(row.ingredientId))
              const unitCost = selected ? selected.purchase_price / selected.purchase_quantity : null
              return (
                <div className={styles.row} key={index}>
                  <select
                    className="formSelect"
                    value={row.ingredientId}
                    onChange={(e) => changeIngredient(index, e.target.value)}
                    required
                  >
                    <option value="">食材を選択</option>
                    {ingredients.map((ingredient) => (
                      <option value={ingredient.id} key={ingredient.id}>
                        {ingredient.name}
                      </option>
                    ))}
                  </select>

                  <div className="formField">
                    <input
                      value={row.quantity}
                      onChange={(e) => changeQuantity(index, e.target.value)}
                      placeholder="使用量"
                      type="number"
                    />
                    <span>{selected?.unit}</span>
                  </div>

                  <div className={styles.unitCost}>
                    {selected && unitCost !== null && `￥${unitCost.toFixed(2)} / ${selected.unit}`}
                  </div>
                  {rows.length > 1 && (
                    <button className={styles.deleteRow} type="button" onClick={() => deleteRow(index)} aria-label="この食材を削除">×</button>
                  )}
                </div>
              )
            })}
            <button className={styles.addBtn} type="button" onClick={addRow}>+ 食材を追加</button>
          </div>
        </form>
      </div>
    )
  }
}

export default UpdateDish
