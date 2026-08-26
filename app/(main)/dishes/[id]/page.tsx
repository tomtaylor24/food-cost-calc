"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuth from "@/app/utils/useAuth"
import calcDishCost from "@/app/utils/calcCost"
import styles from "./page.module.scss"
import toast from "react-hot-toast"
import type { DishDetail, Ingredient } from "@/app/types"
import type { RecipeRow } from "@/app/types"
import CategorySelect from "@/app/components/categorySelect"
import Combobox from "@/app/components/combobox"
import { SubmitEvent } from "react"

type Props = {
  params: Promise<{ id: string }>
}

const UpdateDish = (context: Props) => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [rows, setRows] = useState<RecipeRow[]>([])

  const router = useRouter()
  const loginUserEmail = useAuth()

  useEffect(() => {
    const getDish = async () => {
      try {
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
          setCategoryIds(singleItem.dish_categories.map((row) => String(row.category_id)))
          setRows(singleItem.dish_ingredients.map((item) => ({
            ingredientId: String(item.ingredient_id),
            quantity: String(item.quantity),
          })))
        } else {
          toast.error(jsonData.message)
          router.push("/dishes")
        }
      } catch {
        toast.error("通信に失敗しました")
      }
    }
    getDish()
  }, [context, router])

  useEffect(() => {
    const getIngredients = async () => {
      try {
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
      } catch {
        toast.error("通信に失敗しました")
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
    setIsSubmitting(true)
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
        setIsSubmitting(false)
      }
    } catch {
      toast.error("商品編集に失敗しました")
      setIsSubmitting(false)
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
        router.push("/dishes")
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
    const newRows = rows.filter((_, i) => i !== index)
    setRows(newRows)
  }

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: String(ingredient.id),
    label: ingredient.name
  }))

  const previewItems = rows
    .map((row) => {
      const ingredient = ingredients.find((ing) => ing.id === Number(row.ingredientId))
      if (!ingredient || !row.quantity) return null
      return { quantity: Number(row.quantity), ingredients: ingredient }
    })
    .filter((item) => item !== null)

  const rawCost = calcDishCost(previewItems)
  const totalCost = Math.round(rawCost)
  const costRate = Number(sellingPrice) > 0
    ? Math.round(rawCost / Number(sellingPrice) * 1000) / 10
    : null
  const isOverTarget = costRate !== null && costRate >= 30

  if (loginUserEmail) {
    return (
      <div className="container">
        <div className="breadcrumb">
          <Link href="/dishes">商品一覧</Link>
          <span className="pc">／</span>
          <span className="pc">{name}</span>
        </div>
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">{name}</h1>
          </div>
          <div className="pageActions">
            <button form="dishForm" className="btn formSubmit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting && <span className="btnSpinner" aria-hidden="true" />}変更を保存
            </button>
            <button className="formDelete" type="button" onClick={handleDelete} disabled={isSubmitting}>商品を削除</button>
          </div>
        </div>

        <div className="stats">
          <div className="statsItem">
            <p className="statsLabel">原価合計</p>
            <p className="statsValue">￥{totalCost.toLocaleString()}</p>
          </div>
          <div className="statsItem">
            <p className="statsLabel">販売価格</p>
            <p className="statsValue">{sellingPrice === "" ? "—" : `￥${Number(sellingPrice).toLocaleString()}`}</p>
          </div>
          <div className="statsItem">
            <p className="statsLabel">原価率</p>
            <p className={`statsValue ${isOverTarget ? "statsHigh" : ""}`}>
              {costRate === null ? "—" : `${costRate}%`}
            </p>
          </div>
        </div>

        <form id="dishForm" className={`form ${styles.form}`} onSubmit={handleSubmit}>
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

          <div>
            <div className="sectionHead">
              <p className="sectionLabel">使用する食材</p>
              <p className="sectionNote">単価は食材の仕入れ値から自動で計算されます</p>
            </div>
            <div className={styles.rowsCard}>
              <div className={styles.rowsHead}>
                <div>食材</div>
                <div>使用量</div>
                <div>単価</div>
                <div>小計</div>
                <div></div>
              </div>
              {rows.map((row, index) => {
                const usedByOthers = rows.filter((_, i) => i !== index).map((other) => other.ingredientId)
                const selected = ingredients.find((ingredient) => ingredient.id === Number(row.ingredientId))
                const unitCost = selected ? selected.purchase_price / selected.purchase_quantity : null
                const subtotal = unitCost !== null && row.quantity !== "" ? unitCost * Number(row.quantity) : null
                return (
                  <div className={styles.row} key={index}>
                    <div className={styles.comboWrap}>
                      <Combobox
                        options={ingredientOptions.filter((option) => !usedByOthers.includes(option.value))}
                        value={row.ingredientId}
                        onChange={(newValue) => changeIngredient(index, newValue)}
                        placeholder="食材を検索"
                        ariaLabel={`${index + 1}行目の食材`}
                        emptyMessage="該当する食材がありません"
                        required
                      />
                    </div>

                    <div className={`formField ${styles.quantityWrap}`}>
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
                      {selected && unitCost !== null ? `￥${unitCost.toFixed(2)} / ${selected.unit}` : "—"}
                    </div>

                    <div className={styles.subtotal}>
                      {subtotal !== null ? `￥${Math.round(subtotal).toLocaleString()}` : "—"}
                    </div>

                    {rows.length > 1 ? (
                      <button className={styles.deleteRow} type="button" onClick={() => deleteRow(index)} aria-label={`${index + 1}行目の食材を削除`}>×</button>
                    ) : (
                      <div />
                    )}
                  </div>
                )
              })}
            </div>
            <button className={styles.addBtn} type="button" onClick={addRow}>＋ 食材を追加</button>
          </div>

          <CategorySelect value={categoryIds} onChange={setCategoryIds} />
        </form>
      </div>
    )
  }
}

export default UpdateDish
