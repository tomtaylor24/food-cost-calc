"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, useWatch, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import useAuth from "@/app/utils/useAuth"
import calcDishCost, { calcUnitPrice } from "@/app/utils/calcCost"
import styles from "./page.module.scss"
import type { DishDetail, Ingredient } from "@/app/types"
import CategorySelect from "@/app/components/categorySelect"
import Combobox from "@/app/components/combobox"
import { dishFormSchema } from "@/app/utils/schemas"

type Props = {
  params: Promise<{ id: string }>
}

type DishForm = z.infer<typeof dishFormSchema>

const UpdateDish = (context: Props) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  const router = useRouter()
  const loginUserEmail = useAuth()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<DishForm>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: "",
      sellingPrice: "",
      categoryIds: [],
      note: "",
      rows: []
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: "rows" })
  const rows = useWatch({ control, name: "rows" })
  const name = useWatch({ control, name: "name" })
  const sellingPrice = useWatch({ control, name: "sellingPrice" })

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
          reset({
            name: singleItem.name,
            sellingPrice: String(singleItem.selling_price ?? ""),
            categoryIds: singleItem.dish_categories.map((row) => String(row.category_id)),
            note: singleItem.note ?? "",
            rows: singleItem.dish_ingredients.map((item) => ({
              ingredientId: String(item.ingredient_id),
              quantity: String(item.quantity)
            }))
          })
        } else {
          toast.error(jsonData.message)
          router.push("/dishes")
        }
      } catch {
        toast.error("通信に失敗しました")
      }
    }
    getDish()
  }, [context, router, reset])

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

  const onSubmit = async (data: DishForm) => {
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
          name: data.name,
          sellingPrice: data.sellingPrice === "" ? null : data.sellingPrice,
          categoryIds: data.categoryIds,
          note: data.note.trim() === "" ? null : data.note,
          rows: data.rows.map((row) => ({ ingredientId: row.ingredientId, quantity: row.quantity }))
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
        router.push("/dishes")
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("商品削除に失敗しました")
    }
  }

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: String(ingredient.id),
    label: ingredient.name,
    keywords: ingredient.name_kana ?? ""
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

        <form id="dishForm" className={`form ${styles.form}`} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formRow}>
            <dl>
              <dt><label htmlFor="dish-name">商品名</label></dt>
              <dd>
                <input id="dish-name" className="formInput" {...register("name")} type="text" placeholder="例：唐揚げ定食" aria-invalid={errors.name !== undefined} />
                {errors.name && <p className="formError">{errors.name.message}</p>}
              </dd>
            </dl>
            <dl>
              <dt><label htmlFor="selling-price">販売価格</label></dt>
              <dd>
                <div className="formField">
                  <span>￥</span>
                  <input id="selling-price" {...register("sellingPrice")} type="number" placeholder="980" aria-invalid={errors.sellingPrice !== undefined} />
                </div>
                {errors.sellingPrice && <p className="formError">{errors.sellingPrice.message}</p>}
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
              {fields.map((field, index) => {
                const currentRow = rows[index]
                const usedByOthers = rows.filter((_, i) => i !== index).map((other) => other.ingredientId)
                const selected = ingredients.find((ingredient) => ingredient.id === Number(currentRow?.ingredientId))
                const unitCost = selected ? calcUnitPrice(selected) : null
                const subtotal = unitCost !== null && currentRow?.quantity !== "" ? unitCost * Number(currentRow?.quantity) : null
                return (
                  <div className={styles.row} key={field.id}>
                    <div className={styles.comboWrap}>
                      <Controller
                        name={`rows.${index}.ingredientId`}
                        control={control}
                        render={({ field: comboField }) => (
                          <Combobox
                            options={ingredientOptions.filter((option) => !usedByOthers.includes(option.value))}
                            value={comboField.value}
                            onChange={comboField.onChange}
                            placeholder="食材を検索"
                            ariaLabel={`${index + 1}行目の食材`}
                            emptyMessage="該当する食材がありません"
                          />
                        )}
                      />
                      {errors.rows?.[index]?.ingredientId && <p className="formError">{errors.rows[index].ingredientId.message}</p>}
                    </div>

                    <div className={`formField ${styles.quantityWrap}`}>
                      <input
                        {...register(`rows.${index}.quantity`)}
                        placeholder="使用量"
                        type="number"
                        aria-label={`${index + 1}行目の使用量`}
                        aria-invalid={errors.rows?.[index]?.quantity !== undefined}
                      />
                      <span>{selected?.unit}</span>
                    </div>

                    <div className={styles.unitCost}>
                      {selected && unitCost !== null ? `￥${unitCost.toFixed(2)} / ${selected.unit}` : "—"}
                    </div>

                    <div className={styles.subtotal}>
                      {subtotal !== null ? `￥${Math.round(subtotal).toLocaleString()}` : "—"}
                    </div>

                    {fields.length > 1 ? (
                      <button className={styles.deleteRow} type="button" onClick={() => remove(index)} aria-label={`${index + 1}行目の食材を削除`}>×</button>
                    ) : (
                      <div />
                    )}
                  </div>
                )
              })}
            </div>
            {fields.map((field, index) => (
              errors.rows?.[index]?.quantity
                ? <p className="formError" key={field.id}>{index + 1}行目：{errors.rows[index].quantity.message}</p>
                : null
            ))}
            <button className={styles.addBtn} type="button" onClick={() => append({ ingredientId: "", quantity: "" })}>＋ 食材を追加</button>
          </div>

          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <CategorySelect value={field.value} onChange={field.onChange} />
            )}
          />

          <dl>
            <dt><label htmlFor="dish-note">備考</label></dt>
            <dd>
              <textarea id="dish-note" className="formTextarea" {...register("note")} placeholder="例：ランチのみ提供／ソースは前日に仕込む" maxLength={500} aria-invalid={errors.note !== undefined} />
              {errors.note && <p className="formError">{errors.note.message}</p>}
            </dd>
          </dl>
        </form>
      </div>
    )
  }
}

export default UpdateDish
