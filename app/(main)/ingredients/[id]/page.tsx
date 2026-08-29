"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import useAuth from "@/app/utils/useAuth"
import styles from "./page.module.scss"
import Combobox from "@/app/components/combobox"
import { UNIT_OPTIONS } from "@/app/utils/units"
import { IngredientDetail } from "@/app/types"
import type { PriceHistoryRow } from "@/app/types"
import { calcUnitPrice } from "@/app/utils/calcCost"
import useKanaCapture from "@/app/utils/useKanaCapture"
import { ingredientFormSchema } from "@/app/utils/schemas"

type Props = {
  params: Promise<{ id: string }>
}

type IngredientForm = z.infer<typeof ingredientFormSchema>

const UpdateIngredient = (context: Props) => {
  const [usedCount, setUsedCount] = useState(0)
  const [priceHistory, setPriceHistory] = useState<PriceHistoryRow[]>([])

  const router = useRouter()
  const loginUserEmail = useAuth()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<IngredientForm>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: "",
      nameKana: "",
      purchasePrice: "",
      purchaseQuantity: "",
      unit: "",
      isTaxExcluded: false,
      taxAddRate: "8",
      hasYield: false,
      yieldRate: "",
      supplier: "",
      note: ""
    }
  })

  const name = useWatch({ control, name: "name" })
  const unit = useWatch({ control, name: "unit" })
  const purchasePrice = useWatch({ control, name: "purchasePrice" })
  const purchaseQuantity = useWatch({ control, name: "purchaseQuantity" })
  const isTaxExcluded = useWatch({ control, name: "isTaxExcluded" })
  const taxAddRate = useWatch({ control, name: "taxAddRate" })
  const hasYield = useWatch({ control, name: "hasYield" })
  const yieldRate = useWatch({ control, name: "yieldRate" })

  const kanaCapture = useKanaCapture((kana) => {
    setValue("nameKana", getValues("nameKana") + kana)
  })

  const nameField = register("name")

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
        const singleItem = jsonData.ingredient as IngredientDetail
        if (response.ok) {
          reset({
            name: singleItem.name,
            nameKana: singleItem.name_kana ?? "",
            purchasePrice: String(singleItem.purchase_price),
            purchaseQuantity: String(singleItem.purchase_quantity),
            unit: singleItem.unit,
            isTaxExcluded: singleItem.tax_add_rate !== 0,
            taxAddRate: singleItem.tax_add_rate !== 0 ? String(singleItem.tax_add_rate) : "8",
            hasYield: singleItem.yield_rate !== 100,
            yieldRate: String(singleItem.yield_rate),
            supplier: singleItem.supplier ?? "",
            note: singleItem.note ?? ""
          })
          setUsedCount(singleItem.dish_ingredients[0]?.count ?? 0)
          setPriceHistory(singleItem.ingredient_price_history ?? [])
        } else {
          toast.error(jsonData.message)
          router.push("/ingredients")
        }
      } catch {
        toast.error("通信に失敗しました")
      }
    }
    getIngredient()
  }, [context, router, reset])

  const onSubmit = async (data: IngredientForm) => {
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
          name: data.name,
          nameKana: data.nameKana.trim() === "" ? null : data.nameKana,
          purchasePrice: data.purchasePrice,
          purchaseQuantity: data.purchaseQuantity,
          unit: data.unit,
          yieldRate: data.hasYield ? data.yieldRate : 100,
          taxAddRate: data.isTaxExcluded ? data.taxAddRate : 0,
          supplier: data.supplier.trim() === "" ? null : data.supplier,
          note: data.note.trim() === "" ? null : data.note
        })
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/ingredients")
      } else {
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
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("食材削除に失敗しました")
    }
  }

  const effectiveYield = hasYield ? Number(yieldRate) : 100
  const unitPrice = Number(purchaseQuantity) > 0 && effectiveYield > 0
    ? calcUnitPrice({
      purchase_price: Number(purchasePrice),
      purchase_quantity: Number(purchaseQuantity),
      yield_rate: effectiveYield,
      tax_add_rate: isTaxExcluded ? Number(taxAddRate) : 0
    })
    : null

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
            <button className="formDelete" type="button" onClick={handleDelete} disabled={isSubmitting || usedCount > 0}>食材を削除</button>
          </div>
        </div>
        {usedCount > 0 && (
          <p className="pageNote" role="status">
            この食材は<strong>{usedCount}件の商品</strong>で使われているため削除できません。先に商品側から取り除いてください。
          </p>
        )}

        <form id="ingredientForm" className={`form ${styles.form}`} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formRow}>
            <dl>
              <dt><label htmlFor="ingredient-name">食材名</label></dt>
              <dd>
                <input
                  id="ingredient-name"
                  className="formInput"
                  {...nameField}
                  onChange={(e) => {
                    nameField.onChange(e)
                    if (e.target.value === "") setValue("nameKana", "")
                  }}
                  {...kanaCapture}
                  type="text"
                  placeholder="例：鶏もも肉"
                  aria-invalid={errors.name !== undefined}
                />
                {errors.name && <p className="formError">{errors.name.message}</p>}
              </dd>
            </dl>
            <dl>
              <dt><label htmlFor="ingredient-kana">読み方</label></dt>
              <dd>
                <input id="ingredient-kana" className="formInput" {...register("nameKana")} type="text" placeholder="とりももにく" maxLength={50} aria-invalid={errors.nameKana !== undefined} />
                {errors.nameKana && <p className="formError">{errors.nameKana.message}</p>}
              </dd>
            </dl>
          </div>

          <div className={styles.formRow}>
            <dl>
              <dt><label htmlFor="purchase-price">仕入れ値</label></dt>
              <dd className={styles.priceField}>
                <div className="formField">
                  <span>￥</span>
                  <input id="purchase-price" {...register("purchasePrice")} type="number" placeholder="880" aria-invalid={errors.purchasePrice !== undefined} />
                </div>
                {errors.purchasePrice && <p className="formError">{errors.purchasePrice.message}</p>}
                <label className={`formCheck ${styles.taxCheck}`}>
                  <input type="checkbox" {...register("isTaxExcluded")} />
                  <span>税抜きで入力する</span>
                </label>
                {isTaxExcluded && (
                  <select className="formSelect" {...register("taxAddRate")} aria-label="消費税率">
                    <option value="8">消費税 8％（食品）</option>
                    <option value="10">消費税 10％（酒類など）</option>
                  </select>
                )}
              </dd>
            </dl>
            <dl>
              <dt><label htmlFor="purchase-quantity">仕入れ量</label></dt>
              <dd className={styles.quantity}>
                <input id="purchase-quantity" className="formInput" {...register("purchaseQuantity")} type="number" placeholder="1000" aria-invalid={errors.purchaseQuantity !== undefined} />
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={UNIT_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="単位"
                      allowFreeInput
                      maxLength={10}
                      ariaLabel="単位"
                    />
                  )}
                />
                {errors.purchaseQuantity && <p className="formError">{errors.purchaseQuantity.message}</p>}
                {errors.unit && <p className="formError">{errors.unit.message}</p>}
              </dd>
            </dl>
          </div>

          <div className={styles.yieldBlock}>
            <label className="formCheck">
              <input type="checkbox" {...register("hasYield")} />
              <span>歩留まりを設定する</span>
            </label>
            {hasYield && (
              <div className={`formField ${styles.yieldField}`}>
                <input id="yield-rate" {...register("yieldRate")} type="number" placeholder="85" min="1" max="100" aria-label="歩留まり" aria-invalid={errors.yieldRate !== undefined} />
                <span>％</span>
              </div>
            )}
            {errors.yieldRate && <p className="formError">{errors.yieldRate.message}</p>}
          </div>

          {unitPrice !== null && unit && (
            <p className={styles.unitPrice}>単価換算<span>￥{unitPrice.toFixed(2)} / {unit}</span></p>
          )}

          <dl>
            <dt><label htmlFor="supplier">仕入先</label></dt>
            <dd>
              <input id="supplier" className="formInput" {...register("supplier")} type="text" placeholder="例：山田青果" maxLength={50} aria-invalid={errors.supplier !== undefined} />
              {errors.supplier && <p className="formError">{errors.supplier.message}</p>}
            </dd>
          </dl>

          <dl>
            <dt><label htmlFor="ingredient-note">備考</label></dt>
            <dd>
              <textarea id="ingredient-note" className="formTextarea" {...register("note")} placeholder="例：夏場は値上がりしやすい／冷凍便で週2回入荷" maxLength={500} aria-invalid={errors.note !== undefined} />
              {errors.note && <p className="formError">{errors.note.message}</p>}
            </dd>
          </dl>
        </form>

        {priceHistory.length > 0 && (
          <div className={styles.history}>
            <div className="sectionHead">
              <p className="sectionLabel">仕入れ値の変更履歴</p>
              <p className="sectionNote">新しい順・最新10件まで</p>
            </div>
            <div className="tableCard">
              <div className={styles.historyHead}>
                <div>変更日</div>
                <div>仕入れ値</div>
                <div>仕入れ量</div>
                <div>単価</div>
              </div>
              <ul>
                {priceHistory.map((row) => (
                  <li className={styles.historyRow} key={row.id}>
                    <div>{new Date(row.changed_at).toLocaleDateString("ja-JP")}</div>
                    <div>￥{row.purchase_price.toLocaleString()}</div>
                    <div>{row.purchase_quantity.toLocaleString()}{unit}</div>
                    <div>￥{calcUnitPrice(row).toFixed(2)} / {unit}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default UpdateIngredient
