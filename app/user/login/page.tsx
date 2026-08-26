"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { SubmitEvent } from "react"
import useGuestOnly from "@/app/utils/useGuestOnly"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useRouter()
  useGuestOnly()

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      const jsonData = await response.json()
      if (response.ok) {
        localStorage.setItem("token", jsonData.token)
        toast.success(jsonData.message)
        router.push("/dishes")
      } else {
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("通信に失敗しました")
    }
  }

  return (
    <div className="auth">
      <div className="inner">
        <p className="authLogo">
          <Link href="/"><span aria-hidden="true">G</span>Genkalc</Link>
        </p>
        <h1 className="authTitle">ログイン</h1>
        <p className="authText">メールアドレスとパスワードを入力してください</p>
        <form className="authForm" onSubmit={handleSubmit}>
          <dl>
            <dt><label htmlFor="login-email">メールアドレス</label></dt>
            <dd>
              <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" placeholder="email@example.com" autoComplete="username" required />
            </dd>
          </dl>
          <dl>
            <dt><label htmlFor="login-password">パスワード</label></dt>
            <dd>
              <input id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" autoComplete="current-password" placeholder="********" required />
            </dd>
          </dl>
          <button className="btn">ログイン</button>
        </form>
        <div className="authLink">アカウントをお持ちでない方は<Link href="/user/register">会員登録</Link></div>
      </div>
    </div>
  )
}

export default Login
