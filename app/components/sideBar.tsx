"use client"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import styles from "./sidebar.module.scss"

const SideBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const isDishCreateActive = pathname === "/dishes/create"
  const isIngredientCreateActive = pathname === "/ingredients/create"
  const isDishesActive = !isDishCreateActive && pathname.startsWith("/dishes")
  const isIngredientsActive = !isIngredientCreateActive && pathname.startsWith("/ingredients")

  const handleLogout = () => {
    localStorage.removeItem("token")
    toast.success("ログアウトしました")
    router.push("/user/login")
  }

  return (
    <aside className={styles.sideBar}>
      <p className={styles.title}>
        <Link href="/">
          <span className={styles.mark} aria-hidden="true">G</span>Genkalc
        </Link>
      </p>
      <nav>
        <ul>
          <li><Link href="/dishes" className={isDishesActive ? styles.active : ""}>商品一覧</Link></li>
          <li><Link href="/dishes/create" className={isDishCreateActive ? styles.active : ""}>商品登録</Link></li>
          <li><Link href="/ingredients" className={isIngredientsActive ? styles.active : ""}>食材一覧</Link></li>
          <li><Link href="/ingredients/create" className={isIngredientCreateActive ? styles.active : ""}>食材登録</Link></li>
        </ul>
      </nav>
      <div className={styles.logoutArea}>
        <button type="button" className={styles.logout} onClick={handleLogout}>ログアウト</button>
      </div>
    </aside>
  )
}

export default SideBar
