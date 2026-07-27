import Link from "next/link"

const getSingleItem = async (id) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/item/readsingle/${id}`)
  const jsonData = await response.json()
  const singleItem = jsonData.singleItem
  return singleItem
}

const ReadSingleItem = async (context) => {
  const params = await context.params
  const singleItem = await getSingleItem(params.id)
  return (
    <div>
      <h1>登録した食材の詳細ページ</h1>
      <h1>{singleItem.title}</h1>
      <h2>{singleItem.number}</h2>
      <h2>{singleItem.cost}</h2>
      <Link className="btn" href={`/item/update/${singleItem.id}`}>アイテム編集</Link>
      <Link className="btn" href={`/item/delete/${singleItem.id}`}>アイテム削除</Link>
    </div>
  )
}

export default ReadSingleItem
