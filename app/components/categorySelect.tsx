"use client"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import type { Category } from "@/app/types"
import styles from "./categorySelect.module.scss"

type Props = {
  value: string[]
  onChange: (value: string[]) => void
}

const CategorySelect = ({ value, onChange }: Props) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")

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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: newCategory
        })
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        setCategories([...categories, jsonData.category])
        onChange([...value, String(jsonData.category.id)])
        setNewCategory("")
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("カテゴリー登録に失敗しました")
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("このカテゴリーを削除しますか?\nこのカテゴリーが付いている商品から、この分類が外れます")) return
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        setCategories(categories.filter((category) => category.id !== id))
        onChange(value.filter((selected) => selected !== String(id)))
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("カテゴリー削除に失敗しました")
    }
  }

  const toggleCategory = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((selected) => selected !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <fieldset className={styles.category}>
      <legend className={styles.legend}>カテゴリー（複数選択できます）</legend>
      <div className="chips">
        {categories.map((category) => (
          <div className={styles.chipGroup} key={category.id}>
            <label className="chip">
              <input type="checkbox" value={String(category.id)}
                checked={value.includes(String(category.id))}
                onChange={(e) => toggleCategory(e.target.value)} />
              <span>{category.name}</span>
            </label>
            {value.includes(String(category.id)) ? (
              <button type="button" className={styles.chipDelete}
                onClick={() => handleDeleteCategory(category.id)}
                aria-label={`${category.name}を削除`}>×</button>
            ) : (
              <button type="button" className={styles.chipAdd} tabIndex={-1} aria-hidden="true"
                onClick={() => toggleCategory(String(category.id))}>＋</button>
            )}
          </div>
        ))}
      </div>
      <div className={styles.add}>
        <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
          placeholder="新しいカテゴリー名" maxLength={20} />
        <button type="button" onClick={handleAddCategory}>+ 追加</button>
      </div>
    </fieldset>
  )
}

export default CategorySelect
