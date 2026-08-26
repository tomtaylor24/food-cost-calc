"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { SubmitEvent } from "react"
import useGuestOnly from "@/app/utils/useGuestOnly"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  useGuestOnly()

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/user/login")
      } else {
        toast.error(jsonData.message)
        setIsSubmitting(false)
      }
    }
    catch {
      toast.error("通信に失敗しました")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="inner">
        <p className="authLogo">
          <Link href="/"><span aria-hidden="true">G</span>Genkalc</Link>
        </p>
        <h1 className="authTitle">パスワードの再設定</h1>
        <p className="authText">登録したメールアドレスを入力してください。<br className="pc" />再設定用のリンクをお送りします</p>
        <form className="authForm" onSubmit={handleSubmit}>
          <dl>
            <dt><label htmlFor="forgot-email">メールアドレス</label></dt>
            <dd>
              <input id="forgot-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" placeholder="email@example.com" autoComplete="email" required />
            </dd>
          </dl>
          <button className="btn" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <span className="btnSpinner" aria-hidden="true" />}再設定メールを送る
          </button>
        </form>
        <div className="authLink"><Link href="/user/login">ログインに戻る</Link></div>
      </div>
    </div>
  )
}

export default ForgotPassword
