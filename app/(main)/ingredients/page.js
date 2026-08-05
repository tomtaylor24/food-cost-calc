"use client"
import { useState, useEffect } from "react"
import useAuth from "@/app/utils/useAuth"
import Link from "next/link"
import styles from "./page.module.scss"
import toast from "react-hot-toast"


const IngredientsList = () => {
  const [ingredients, setIngredientsList] = useState([])
  const loginUserEmail = useAuth()
  const [isLoading, setIsLoading] = useState(true)

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
          setIngredientsList(jsonData.ingredients)
        } else {
          toast.error(jsonData.message)
        }
      } finally {
        setIsLoading(false)
      }
    }
    getIngredients()
  }, [])

  if (!loginUserEmail) return null

  if (isLoading) {
    return (
      <div className="container">
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">食材一覧</h1>
            <p className="pageDescription">登録済みの食材と仕入れ情報を確認できます</p>
          </div>
          <div className="pageBtns">
            <Link href="/ingredients/create" className="btn">+ 新しい食材を登録</Link>
          </div>
        </div>
        <ul className={styles.table}>
          {[...Array(5)].map((_, i) => (
            <li className={styles.tableItem} key={i}>
              <div className={styles.skeletonInner}>
                <div><span /></div>
                <div><span /></div>
                <div><span /></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (ingredients.length === 0) {
    return (
      <div className="container">
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">食材一覧</h1>
            <p className="pageDescription">登録済みの食材と仕入れ情報を確認できます</p>
          </div>
        </div>
        <div className="emptyState">
          <p className="emptyStateTitle">まだ食材が登録されていません</p>
          <p className="emptyStateText">仕入れ値と仕入れ量を登録すると、<br className="pc" />商品の原価計算に使えるようになります。</p>
          <Link href="/ingredients/create" className="btn emptyStateBtn">最初の食材を登録する</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="container">
      <div className="pageMain">
        <div className="pageHeading">
          <h1 className="pageTitle">食材一覧</h1>
          <p className="pageDescription">登録済みの食材と仕入れ情報を確認できます</p>
        </div>
        <div className="pageBtns">
          <Link href="/ingredients/create" className="btn">+ 新しい食材を登録</Link>
        </div>
      </div>
      <ul className={styles.table}>
        <li className={`${styles.tableItem} ${styles.title}`}>
          <div>食材名</div>
          <div>仕入れ値</div>
          <div>仕入れ量</div>
        </li>
        {ingredients.map((ingredient) => (
          <li className={styles.tableItem} key={ingredient.id}>
            <Link href={`/ingredients/${ingredient.id}`}>
              <div>{ingredient.name}</div>
              <div>￥{ingredient.purchase_price.toLocaleString()}</div>
              <div>{ingredient.purchase_quantity.toLocaleString()}{ingredient.unit}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

}

export default IngredientsList
