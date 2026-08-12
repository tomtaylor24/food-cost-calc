"use client"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import type { Category } from "@/app/types"
import styles from "./categorySelect.module.scss"

type Props = {
  value: string
  onChange: (value: string) => void
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
        onChange(String(jsonData.category.id))
        setNewCategory("")
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("カテゴリー登録に失敗しました")
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("このカテゴリーを削除しますか?\nこの分類が付いている商品は「未分類」になります")) return
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
        onChange("")
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("カテゴリー削除に失敗しました")
    }
  }

  return (
    <fieldset className={styles.category}>
      <legend className={styles.legend}>カテゴリー</legend>
      <div className="chips">
        <label className="chip">
          <input type="radio" name="category" value="" checked={value === ""} onChange={(e) => onChange(e.target.value)} />
          <span>なし</span>
        </label>
        {categories.map((category) => (
          <div className={styles.chipGroup} key={category.id}>
            <label className="chip">
              <input type="radio" name="category" value={String(category.id)}
                checked={value === String(category.id)} onChange={(e) => onChange(e.target.value)} />
              <span>{category.name}</span>
            </label>
            {value === String(category.id) && (
              <button type="button" className={styles.chipDelete}
                onClick={() => handleDeleteCategory(category.id)}
                aria-label={`${category.name}を削除`}>×</button>
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
