"use client"
import { useState } from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import toast from "react-hot-toast"
import { SubmitEvent } from "react"


const Register = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useRouter()

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/user/register", {
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
      if(response.ok){
        toast.success(jsonData.message)
        router.push("/user/login")
      }else{
        toast.error(jsonData.message)
      }
    } catch {
      toast.error("通信に失敗しました")
    }
  }

  return (
    <div className="auth">
      <div className="inner">
        <h1 className="authTitle">会員登録</h1>
        <p className="authText">無料でアカウントを作成できます</p>
        <form className="authForm" onSubmit={handleSubmit}>
          <dl>
            <dt><label htmlFor="register-email">メールアドレス</label></dt>
            <dd>
              <input id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" placeholder="email@example.com" autoComplete="email" required />
            </dd>
          </dl>
          <dl>
            <dt><label htmlFor="register-password">パスワード</label></dt>
            <dd>
              <input id="register-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="********" autoComplete="new-password" required />
            </dd>
          </dl>
          <button className="btn">登録する</button>
        </form>
        <div className="authLink">すでにアカウントをお持ちの方は<Link href="/user/login">ログイン</Link></div>
      </div>
    </div>
  )
}

export default Register
