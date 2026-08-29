"use client"
import { useState, useEffect } from "react"
import useAuth from "@/app/utils/useAuth"
import Link from "next/link"
import styles from "./page.module.scss"
import toast from "react-hot-toast"
import type { Ingredient } from "@/app/types"
import { calcUnitPrice } from "@/app/utils/calcCost"
import normalizeText from "@/app/utils/normalizeText"


const IngredientsList = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const loginUserEmail = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [query, setQuery] = useState("")

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
          setLoadError(true)
        }
      } catch {
        setLoadError(true)
        toast.error("通信に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }
    getIngredients()
  }, [])

  const normalizedQuery = normalizeText(query.trim())
  const visibleIngredients = normalizedQuery === ""
    ? ingredients
    : ingredients.filter((ingredient) =>
      normalizeText(`${ingredient.name} ${ingredient.name_kana ?? ""} ${ingredient.supplier ?? ""}`).includes(normalizedQuery)
    )

  const heading = (
    <div className="pageHeading">
      <h1 className="pageTitle">食材一覧</h1>
      <p className="pageDescription">登録済みの食材と仕入れ情報を確認できます</p>
    </div>
  )

  if (!loginUserEmail) return null

  if (isLoading) {
    return (
      <div className="container">
        <div className="pageMain">
          {heading}
          <div className="pageBtns">
            <Link href="/ingredients/create" className="btn">+ 新しい食材を登録</Link>
          </div>
        </div>
        <div className="tableCard">
          <ul>
            {[...Array(5)].map((_, i) => (
              <li className={styles.skeletonRow} key={i}>
                <div className={styles.skeletonInner}>
                  <div><span /></div>
                  <div><span /></div>
                  <div><span /></div>
                  <div><span /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container">
        <div className="pageMain">
          {heading}
        </div>
        <div className="errorState">
          <p className="errorStateIcon" aria-hidden="true">!</p>
          <p className="errorStateTitle">読み込みに失敗しました</p>
          <p className="errorStateText">通信環境を確認して、もう一度お試しください。</p>
          <button type="button" className="errorStateBtn" onClick={() => location.reload()}>再読み込み</button>
        </div>
      </div>
    )
  }

  if (ingredients.length === 0) {
    return (
      <div className="container">
        <div className="pageMain">
          {heading}
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
        {heading}
        <div className="pageBtns">
          <Link href="/ingredients/create" className="btn">+ 新しい食材を登録</Link>
        </div>
      </div>
      <div className={styles.searchRow}>
        <div className={styles.search}>
          <input
            id="ingredient-search"
            type="search"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="食材名・読み方・仕入先で検索"
            aria-label="食材を検索"
          />
          {query !== "" && (
            <button type="button" className={styles.searchClear} onClick={() => setQuery("")} aria-label="検索条件をクリア">×</button>
          )}
        </div>
        <p className={styles.count} role="status">
          {normalizedQuery === "" ? `全${ingredients.length}件` : `${ingredients.length}件中 ${visibleIngredients.length}件`}
        </p>
      </div>
      {visibleIngredients.length === 0 ? (
        <div className="emptyState">
          <p className="emptyStateTitle">見つかりませんでした</p>
          <p className="emptyStateText">「{query}」に一致する食材はありません。<br className="pc" />別のことばでお試しください。</p>
          <button type="button" className="btn emptyStateBtn" onClick={() => setQuery("")}>検索条件をクリア</button>
        </div>
      ) : (
        <div className="tableCard">
          <div className={styles.head}>
            <div>食材名</div>
            <div>仕入れ値</div>
            <div>仕入れ量</div>
            <div>単価</div>
          </div>
          <ul>
            {visibleIngredients.map((ingredient) => (
              <li className={styles.row} key={ingredient.id}>
                <Link href={`/ingredients/${ingredient.id}`}>
                  <div>{ingredient.name}</div>
                  <div>￥{ingredient.purchase_price.toLocaleString()}</div>
                  <div>{ingredient.purchase_quantity.toLocaleString()}{ingredient.unit}</div>
                  <div>￥{calcUnitPrice(ingredient).toFixed(2)} / {ingredient.unit}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

}

export default IngredientsList
