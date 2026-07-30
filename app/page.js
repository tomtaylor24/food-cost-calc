import Link from "next/link"

const Home = () => {
  return (
    <div>
      <h2>食材の仕入れ値から、商品の原価を自動計算します。</h2>
      <Link href="/ingredients">食材一覧へ</Link>
    </div>
  )
}

export default Home
