"use client"
import { useState, useEffect } from "react"
import useAuth from "@/app/utils/useAuth"
import Link from "next/link"
import styles from "./page.module.scss"
import toast from "react-hot-toast"
import type { DishWithCost, Category } from "@/app/types"


const DishesList = () => {
  const [dishes, setDishesList] = useState<DishWithCost[]>([])
  const loginUserEmail = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filterId, setFilterId] = useState("all")
  const [categories, setCategories] = useState<Category[]>([])
  const [sortKey, setSortKey] = useState("created_desc")

  useEffect(() => {
    const getDishes = async () => {
      try {
        const response = await fetch("/api/dishes", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
        const jsonData = await response.json()
        if (response.ok) {
          setDishesList(jsonData.dishes)
        } else {
          toast.error(jsonData.message)
        }
      } catch {
        setLoadError(true)
        toast.error("通信に失敗しました")
      }
      finally {
        setIsLoading(false)
      }
    }
    getDishes()
  }, [])

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetch("/api/categories", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
        const jsonData = await response.json()
        if (response.ok) {
          setCategories(jsonData.categories)
        } else {
          toast.error(jsonData.message)
        }
      } catch {
        toast.error("通信に失敗しました")
      }
    }
    getCategories()
  }, [])

  const visibleDishes = dishes.filter((dish) => {
    if (filterId === "all") return true
    if (filterId === "") return dish.categories.length === 0
    return dish.categories.some((category) => category.id === Number(filterId))
  })

  let sumCost = 0
  let sumPrice = 0
  let excludedCount = 0

  for (const dish of visibleDishes) {
    if (dish.selling_price === null) {
      excludedCount = excludedCount + 1
    } else {
      sumCost = sumCost + dish.totalCost
      sumPrice = sumPrice + dish.selling_price
    }
  }

  const averageRate = sumPrice > 0 ? Math.round(sumCost / sumPrice * 1000) / 10 : null

  const sortValue = (dish: DishWithCost) => {
    if (sortKey === "price_desc" || sortKey === "price_asc") {
      return dish.selling_price
    }
    if (sortKey === "cost_desc" || sortKey === "cost_asc") {
      return dish.totalCost
    }
    if (dish.selling_price === null || dish.selling_price === 0) {
      return null
    }
    return dish.totalCost / dish.selling_price
  }

  const sortedDishes = [...visibleDishes]

  if (sortKey !== "created_desc") {
    sortedDishes.sort((a, b) => {
      const valueA = sortValue(a)
      const valueB = sortValue(b)

      if (valueA === null && valueB === null) return 0
      if (valueA === null) return 1
      if (valueB === null) return -1

      if (sortKey === "price_asc" || sortKey === "cost_asc" || sortKey === "rate_asc") {
        return valueA - valueB
      }
      return valueB - valueA
    })
  }


  const filterChips = (
    <fieldset className={styles.filter}>
      <legend>カテゴリー</legend>
      <div className="chips">
        <label className="chip">
          <input type="radio" name="filter" value="all"
            checked={filterId === "all"} onChange={(e) => setFilterId(e.target.value)} />
          <span>すべて</span>
        </label>
        {categories.map((category) => (
          <label className="chip" key={category.id}>
            <input type="radio" name="filter" value={String(category.id)}
              checked={filterId === String(category.id)} onChange={(e) => setFilterId(e.target.value)} />
            <span>{category.name}</span>
          </label>
        ))}
        <label className="chip">
          <input type="radio" name="filter" value=""
            checked={filterId === ""} onChange={(e) => setFilterId(e.target.value)} />
          <span>未分類</span>
        </label>
      </div>
    </fieldset>
  )

  if (!loginUserEmail) return null

  if (isLoading) {
    return (
      <div className="container">
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">商品一覧</h1>
            <p className="pageDescription">登録済みの商品と原価率を確認できます</p>
          </div>
          <div className="pageBtns">
            <Link href="/dishes/create" className="btn">+ 新しい商品を登録</Link>
          </div>
        </div>
        <ul className={styles.table}>
          {[...Array(5)].map((_, i) => (
            <li className={styles.tableItem} key={i}>
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
    )
  }

  if (loadError) {
    return (
      <div className="container">
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">商品一覧</h1>
            <p className="pageDescription">登録済みの商品と原価率を確認できます</p>
          </div>
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

  if (dishes.length === 0) {
    return (
      <div className="container">
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">商品一覧</h1>
            <p className="pageDescription">登録済みの商品と原価率を確認できます</p>
          </div>
        </div>
        <div className="emptyState">
          <p className="emptyStateTitle">まだ商品が登録されていません</p>
          <p className="emptyStateText">
            食材を組み合わせて商品を登録すると、<br className="pc" />原価と原価率が自動で計算されます。<br />
            商品の登録には食材が必要です。まだの場合は<Link href="/ingredients/create" className="emptyStateLink">食材の登録</Link>から始めてください。
          </p>
          <Link href="/dishes/create" className="btn emptyStateBtn">最初の商品を登録する</Link>
        </div>
      </div>
    )
  }

  if (visibleDishes.length === 0) {
    return (
      <div className="container">
        <div className="pageMain">
          <div className="pageHeading">
            <h1 className="pageTitle">商品一覧</h1>
            <p className="pageDescription">登録済みの商品と原価率を確認できます</p>
          </div>
        </div>
        {filterChips}
        <div className="emptyState">
          <p className="emptyStateTitle">このカテゴリーには商品がありません</p>
          <button type="button" className="btn emptyStateBtn" onClick={() => setFilterId("all")}>すべての商品を表示</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="pageMain">
        <div className="pageHeading">
          <h1 className="pageTitle">商品一覧</h1>
          <p className="pageDescription">登録済みの商品と原価率を確認できます</p>
        </div>
        <div className="pageBtns">
          <Link href="/dishes/create" className="btn">+ 新しい商品を登録</Link>
        </div>
      </div>
      {filterChips}
      <div className={styles.summary}>
        <p className={styles.summaryCount}>{visibleDishes.length}品</p>
        {averageRate !== null && (
          <p className={styles.summaryRate}>平均原価率 <span>{averageRate}%</span></p>
        )}
        {excludedCount > 0 && (
          <p className={styles.summaryNote}>※売価未設定の{excludedCount}品を除く</p>
        )}
      </div>

      <div className={styles.sortWrap}>
        <label className={styles.sortLabel}>
          <svg className={styles.sortIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M5 13.5V2.5M2 5.5L5 2.5L8 5.5M11 2.5V13.5M8 10.5L11 13.5L14 10.5"
              fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          並べ替え
        </label>
        <select className={styles.sort} value={sortKey} onChange={(e) => setSortKey(e.target.value)}
          aria-label="並べ替え">
          <option value="created_desc">登録が新しい順</option>
          <option value="rate_desc">原価率が高い順</option>
          <option value="rate_asc">原価率が低い順</option>
          <option value="cost_desc">原価が高い順</option>
          <option value="cost_asc">原価が安い順</option>
          <option value="price_desc">売価が高い順</option>
          <option value="price_asc">売価が安い順</option>
        </select>
      </div>

      <ul className={styles.table}>
        <li className={`${styles.tableItem} ${styles.title}`}>
          <div>料理名</div>
          <div>売価</div>
          <div>原価</div>
          <div>原価率</div>
        </li>
        {sortedDishes.map((dish) => {
          const costRate = dish.selling_price
            ? Math.round(dish.totalCost / dish.selling_price * 100)
            : null
          return (
            <li className={styles.tableItem} key={dish.id}>
              <Link href={`/dishes/${dish.id}`}>
                <div>{dish.name}</div>
                <div>{dish.selling_price ? `￥${dish.selling_price.toLocaleString()}` : "—"}</div>
                <div>￥{Math.round(dish.totalCost).toLocaleString()}</div>
                <div>
                  {costRate !== null && (
                    <span className={costRate >= 30 ? styles.high : undefined}>{costRate}%</span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default DishesList
