"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { SubmitEvent } from "react"
import useGuestOnly from "@/app/utils/useGuestOnly"

type Props = {
  params: Promise<{ token: string }>
}

const ResetPassword = (context: Props) => {
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  useGuestOnly()

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const params = await context.params
      const response = await fetch(`/api/user/reset-password/${params.token}`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: password
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
        <h1 className="authTitle">新しいパスワードを設定</h1>
        <p className="authText">8文字以上のパスワードを入力してください</p>
        <form className="authForm" onSubmit={handleSubmit}>
          <dl>
            <dt><label htmlFor="reset-password">新しいパスワード</label></dt>
            <dd>
              <input id="reset-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="********" autoComplete="new-password" minLength={8} required />
            </dd>
          </dl>
          <button className="btn" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <span className="btnSpinner" aria-hidden="true" />}パスワードを変更する
          </button>
        </form>
        <div className="authLink"><Link href="/user/login">ログインに戻る</Link></div>
      </div>
    </div>
  )
}

export default ResetPassword
