"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import styles from "./sidebar.module.scss"

const SideBar = () => {
  const pathname = usePathname()
  const isDishCreateActive = pathname === "/dishes/create"
  const isIngredientCreateActive = pathname === "/ingredients/create"
  const isDishesActive = !isDishCreateActive && (pathname === "/" || pathname.startsWith("/dishes"))
  const isIngredientsActive = !isIngredientCreateActive && pathname.startsWith("/ingredients")
  return (
    <aside className={styles.sideBar}>
      <p className={styles.title}><Link href="/">■原価管理ツール</Link></p>
      <nav>
        <ul>
          <li><Link href="/" className={isDishesActive ? styles.active : ""}>商品一覧</Link></li>
          <li><Link href="/dishes/create" className={isDishCreateActive ? styles.active : ""}>商品登録</Link></li>
          <li><Link href="/ingredients" className={isIngredientsActive ? styles.active : ""}>食材一覧</Link></li>
          <li><Link href="/ingredients/create" className={isIngredientCreateActive ? styles.active : ""}>食材登録</Link></li>
        </ul>
      </nav>
    </aside>
  )
}

export default SideBar
