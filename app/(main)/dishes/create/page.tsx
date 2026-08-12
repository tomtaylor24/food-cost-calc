"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuth from "@/app/utils/useAuth"
import calcDishCost from "@/app/utils/calcCost"
import styles from "./page.module.scss"
import toast from "react-hot-toast"
import { SubmitEvent } from "react"
import type { Ingredient } from "@/app/types"
import CategorySelect from "@/app/components/categorySelect"
import Combobox from "@/app/components/combobox"


const CreateDishes = () => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [rows, setRows] = useState([
    { ingredientId: "", quantity: "" }
  ])

  const router = useRouter()
  const loginUserEmail = useAuth()

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
    const seenIds: string[] = []

    for (const row of rows) {
      if (row.ingredientId === "") continue

      if (seenIds.includes(row.ingredientId)) {
        toast.error("同じ食材が複数の行で選ばれています")
        return
      }

      seenIds.push(row.ingredientId)
    }

    try {
      const response = await fetch("/api/dishes", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: name,
          sellingPrice: sellingPrice === "" ? null : sellingPrice,
          categoryIds: categoryIds,
          rows: rows
        })
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/dishes")
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("商品登録に失敗しました")
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
    const newRows = rows.filter((_, i) => i !== index)
    setRows(newRows)
  }

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: String(ingredient.id),
    label: ingredient.name
  }))

  const previewItems = rows
    .map((row) => {
      const ingredient = ingredients.find((ingredient) => ingredient.id === Number(row.ingredientId))
      if (!ingredient || !row.quantity) return null
      return { quantity: Number(row.quantity), ingredients: ingredient }
    })
    .filter((item) => item !== null)

  const previewCost = calcDishCost(previewItems)

  if (loginUserEmail) {
    return (
      <div className="container">
        <div className="breadcrumb">
          <Link href="/dishes">商品一覧</Link>
          <span className="pc">／</span>
          <span className="pc">新しい商品を登録</span>
        </div>
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">新しい商品を登録</h1>
          </div>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <dl>
              <dt><label htmlFor="dish-name">商品名</label></dt>
              <dd>
                <input id="dish-name" className="formInput" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="例：唐揚げ定食" required />
              </dd>
            </dl>
            <dl>
              <dt><label htmlFor="selling-price">販売価格</label></dt>
              <dd>
                <div className="formField">
                  <span>￥</span>
                  <input id="selling-price" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" placeholder="980" />
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
              const usedByOthers = rows.filter((_, i) => i !== index).map((other) => other.ingredientId)
              const selected = ingredients.find((ingredient) => ingredient.id === Number(row.ingredientId))
              const unitCost = selected ? selected.purchase_price / selected.purchase_quantity : null
              return (
                <div className={styles.row} key={index}>
                  <Combobox
                    options={ingredientOptions.filter((option) => !usedByOthers.includes(option.value))}
                    value={row.ingredientId}
                    onChange={(newValue) => changeIngredient(index, newValue)}
                    placeholder="食材を検索"
                    ariaLabel={`${index + 1}行目の食材`}
                    emptyMessage="該当する食材がありません"
                    required
                  />

                  <div className="formField">
                    <input
                      value={row.quantity}
                      onChange={(e) => changeQuantity(index, e.target.value)}
                      placeholder="使用量"
                      type="number"
                      aria-label={`${index + 1}行目の使用量`}
                    />
                    <span>{selected?.unit}</span>
                  </div>

                  <div className={styles.unitCost}>
                    {selected && unitCost !== null && `￥${unitCost.toFixed(2)} / ${selected.unit}`}
                  </div>
                  {rows.length > 1 && (
                    <button className={styles.deleteBtn} type="button" onClick={() => deleteRow(index)} aria-label="この食材を削除">×</button>
                  )}
                </div>
              )
            })}
            <button className={styles.addBtn} type="button" onClick={addRow}>+ 食材を追加</button>
          </div>

          <CategorySelect value={categoryIds} onChange={setCategoryIds} />


          <p className={styles.preview}>この商品の原価：<span>￥{Math.round(previewCost).toLocaleString()}</span></p>

          <div className={`formBtns ${styles.formBtns}`}>
            <button className="btn formSubmit">商品を登録</button>
            <Link href="/dishes" className="formCancel pc">キャンセル</Link>
          </div>
        </form>
      </div>
    )
  }
}

export default CreateDishes
