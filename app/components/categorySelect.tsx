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
  const [isEditing, setIsEditing] = useState(false)

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
        const rest = categories.filter((category) => category.id !== id)
        setCategories(rest)
        onChange(value.filter((selected) => selected !== String(id)))
        if (rest.length === 0) {
          setIsEditing(false)
        }
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

  const selectedCategories = categories.filter((category) => value.includes(String(category.id)))
  const restCategories = categories.filter((category) => !value.includes(String(category.id)))

  return (
    <fieldset className={styles.category}>
      <div className="sectionHead">
        <legend className={`sectionLabel ${styles.legend}`}>カテゴリー</legend>
        <p className="sectionNote">{isEditing ? "クリックすると削除されます" : "複数選択できます"}</p>
      </div>

      <div className={styles.box}>
        {isEditing ? (
          <div className={styles.rest}>
            {categories.map((category) => (
              <button type="button" className={styles.editChip} key={category.id}
                onClick={() => handleDeleteCategory(category.id)}>
                {category.name}
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className={styles.selected}>
              <p className={styles.selectedLabel}>選択中</p>
              {selectedCategories.length === 0 ? (
                <p className={styles.selectedEmpty}>なし</p>
              ) : (
                selectedCategories.map((category) => (
                  <button type="button" className={styles.selectedChip} key={category.id}
                    onClick={() => toggleCategory(String(category.id))}
                    aria-label={`${category.name}の選択を外す`}>
                    {category.name}
                    <span aria-hidden="true">×</span>
                  </button>
                ))
              )}
            </div>
            <div className={styles.rest}>
              {restCategories.map((category) => (
                <button type="button" className={styles.restChip} key={category.id}
                  onClick={() => toggleCategory(String(category.id))}
                  aria-label={`${category.name}を選ぶ`}>
                  {category.name}
                </button>
              ))}
            </div>
          </>
        )}

        <div className={styles.add}>
          {isEditing ? (
            <button type="button" onClick={() => setIsEditing(false)}>完了</button>
          ) : (
            <>
              <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                placeholder="新しいカテゴリー名" maxLength={20} />
              <button type="button" onClick={handleAddCategory}>追加</button>
              {categories.length > 0 && (
                <button type="button" className={styles.editToggle}
                  onClick={() => setIsEditing(true)}>カテゴリーを編集</button>
              )}
            </>
          )}
        </div>
      </div>
    </fieldset>
  )
}

export default CategorySelect
