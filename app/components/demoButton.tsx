"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

type Props = {
  className?: string
}

const DemoButton = ({ className }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/demo", { method: "POST" })
      const jsonData = await response.json()
      if (response.ok) {
        localStorage.setItem("token", jsonData.token)
        router.push("/dishes")
      } else {
        toast.error(jsonData.message)
        setIsLoading(false)
      }
    } catch {
      toast.error("通信に失敗しました")
      setIsLoading(false)
    }
  }

  return (
    <button type="button" className={className ? `btn ${className}` : "btn"} onClick={handleClick} disabled={isLoading}>
      {isLoading ? "準備しています…" : "デモを試す(登録不要)"}
    </button>
  )
}

export default DemoButton
