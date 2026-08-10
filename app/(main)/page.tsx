"use client"
import { useState, useEffect } from "react"
import useAuth from "@/app/utils/useAuth"
import Link from "next/link"
import styles from "./page.module.scss"
import toast from "react-hot-toast"
import type { DishWithCost } from "../types"


const DishesList = () => {
  const [dishes, setDishesList] = useState<DishWithCost[]>([])
  const loginUserEmail = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

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
      } catch{
        setLoadError (true)
        toast.error("通信に失敗しました")
      }
      finally {
        setIsLoading(false)
      }
    }
    getDishes()
  }, [])

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
        <li className={`${styles.tableItem} ${styles.title}`}>
          <div>料理名</div>
          <div>売価</div>
          <div>原価</div>
          <div>原価率</div>
        </li>
        {dishes.map((dish) => {
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
