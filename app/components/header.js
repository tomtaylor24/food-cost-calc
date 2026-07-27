import Link from "next/link"

const Header = () => {
    return (
        <header>
            <Link href="/">
              <h1>飲食店原価計算ツール</h1>
            </Link>
            <nav>
                <ul className="headerLink">
                    <li className="headerLink__item"><Link href="/user/register">登録</Link></li>
                    <li className="headerLink__item"><Link href="/user/login">ログイン</Link></li>
                    <li className="headerLink__item"><Link href="/item/create">アイテム作成</Link></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header
