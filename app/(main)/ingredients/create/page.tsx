"use client"
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
import useKanaCapture from "@/app/utils/useKanaCapture"
import { ingredientFormSchema } from "@/app/utils/schemas"

type IngredientForm = z.infer<typeof ingredientFormSchema>

const CreateIngredients = () => {
  const router = useRouter()
  const loginUserEmail = useAuth()

  const {
    register,
    handleSubmit,
    control,
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

  const isTaxExcluded = useWatch({ control, name: "isTaxExcluded" })
  const hasYield = useWatch({ control, name: "hasYield" })

  const kanaCapture = useKanaCapture((kana) => {
    setValue("nameKana", getValues("nameKana") + kana)
  })

  const nameField = register("name")

  const onSubmit = async (data: IngredientForm) => {
    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
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
      toast.error("通信に失敗しました")
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
      <form className={`form ${styles.form}`} onSubmit={handleSubmit(onSubmit)} noValidate>
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
