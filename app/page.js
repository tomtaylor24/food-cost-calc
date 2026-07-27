export const dynamic = "force-dynamic"
import Link from "next/link"

const getAllItems = async() => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/item/readall`)
  const jsonData = await response.json()
  const allItems = jsonData.allItems
  return allItems
}

const ReadAllItems = async() => {
  const allItems = await getAllItems()
  return(
    <div>
      <h1>食材一覧ページ</h1>
      <ul className="foodList">
      {allItems.map(item => 
      <li className="foodList__item" key={item.id}>
        <Link href={`/item/readsingle/${item.id}`}>
          <h2>{item.title}</h2>
          <h4>{item.number}</h4>
          <h4>{item.cost}</h4>
        </Link>
      </li>
      )}
      </ul>
    </div>
  )
}

export default ReadAllItems
