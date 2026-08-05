"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuth from "@/app/utils/useAuth"
import calcDishCost from "@/app/utils/calcCost"
import styles from "./page.module.scss"
import toast from "react-hot-toast"


const CreateDishes = () => {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [ingredients, setIngredients] = useState([])
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

  const handleSubmit = async (e) => {
    e.preventDefault()
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
          sellingPrice: sellingPrice,
          rows: rows
        })
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/")
      }else{
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("商品登録に失敗しました")
    }
  }

  const changeIngredient = (index, value) => {
    const newRows = [...rows]
    newRows[index] = {...newRows[index], ingredientId: value}
    setRows(newRows)
  }

  const changeQuantity = (index, value) => {
    const newRows = [...rows]
    newRows[index] = {...newRows[index], quantity: value}
    setRows(newRows)
  }

  const addRow = () => {
    setRows([...rows, {ingredientId: "", quantity: ""}])
  }

  const deleteRow = (index) => {
    const newRows = rows.filter((row, i) => i !== index)
    setRows(newRows)
  }

  const previewItems = rows
  .filter((row) => row.ingredientId && row.quantity)
  .map((row) => {
    const ingredient = ingredients.find((ingredient) => ingredient.id === Number(row.ingredientId))
    return {quantity: Number(row.quantity), ingredients: ingredient}
  })

  const previewCost = calcDishCost(previewItems)

  if (loginUserEmail) {
    return (
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">商品一覧</Link>
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
                    {unitCost !== null && `￥${unitCost.toFixed(2)} / ${selected.unit}`}
                  </div>
                  {rows.length > 1 && (
                    <button className={styles.deleteBtn} type="button" onClick={() => deleteRow(index)} aria-label="この食材を削除">×</button>
                  )}
                </div>
              )
            })}
            <button className={styles.addBtn} type="button" onClick={addRow}>+ 食材を追加</button>
          </div>

          <p className={styles.preview}>この商品の原価：<span>￥{Math.round(previewCost).toLocaleString()}</span></p>

          <div className={`formBtns ${styles.formBtns}`}>
            <button className="btn formSubmit">商品を登録</button>
            <Link href="/" className="formCancel pc">キャンセル</Link>
          </div>
        </form>
      </div>
    )
  }
}

export default CreateDishes
