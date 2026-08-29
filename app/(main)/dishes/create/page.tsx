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
import type { Ingredient } from "@/app/types"
import CategorySelect from "@/app/components/categorySelect"
import Combobox from "@/app/components/combobox"
import { dishFormSchema } from "@/app/utils/schemas"

type DishForm = z.infer<typeof dishFormSchema>

const CreateDishes = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  const router = useRouter()
  const loginUserEmail = useAuth()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<DishForm>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: "",
      sellingPrice: "",
      categoryIds: [],
      note: "",
      rows: [{ ingredientId: "", quantity: "" }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: "rows" })
  const rows = useWatch({ control, name: "rows" })

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
      const response = await fetch("/api/dishes", {
        method: "POST",
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
      toast.error("商品登録に失敗しました")
    }
  }

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: String(ingredient.id),
    label: ingredient.name,
    keywords: ingredient.name_kana ?? ""
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
        <form className={`form ${styles.form}`} onSubmit={handleSubmit(onSubmit)} noValidate>
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
                      <button className={styles.deleteBtn} type="button" onClick={() => remove(index)} aria-label={`${index + 1}行目の食材を削除`}>×</button>
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

          <p className={styles.preview}>この商品の原価：<span>￥{Math.round(previewCost).toLocaleString()}</span></p>

          <div className={`formBtns ${styles.formBtns}`}>
            <button className="btn formSubmit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting && <span className="btnSpinner" aria-hidden="true" />}商品を登録
            </button>
            <Link href="/dishes" className="formCancel pc">キャンセル</Link>
          </div>
        </form>
      </div>
    )
  }
}

export default CreateDishes
