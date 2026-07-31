import Link from "next/link"

const Header = () => {
    return (
        <header className="header">
            <Link href="/">
              <h1>飲食店原価計算ツール</h1>
            </Link>
            <nav>
                <ul className="headerLink">
                    <li className="headerLink__item"><Link href="/user/register">会員登録</Link></li>
                    <li className="headerLink__item"><Link href="/user/login">ログイン</Link></li>
                    <li className="headerLink__item"><Link href="/ingredients/create">食材登録</Link></li>
                    <li className="headerLink__item"><Link href="/ingredients/">食材一覧</Link></li>
                    <li className="headerLink__item"><Link href="/dishes/create">商品登録</Link></li>
                    <li className="headerLink__item"><Link href="/dishes/">商品一覧</Link></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header
