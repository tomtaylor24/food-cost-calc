"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useRouter()

  const handleSubmit = async (e) => {
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
      localStorage.setItem("token", jsonData.token)
      if(response.ok){
        toast.success(jsonData.message)
        router.push("/")
      }else{
        toast.error(jsonData.message)
      }
    }
    catch {
      toast.error(jsonData.message)
    }
  }

  return (
    <div className="auth">
      <div className="inner">
        <h1 className="authTitle">原価管理ツールにログイン</h1>
        <p className="authText">メールアドレスとパスワードを入力してください</p>
        <form className="authForm" onSubmit={handleSubmit}>
          <dl>
            <dt>メールアドレス</dt>
            <dd>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" name="email" placeholder="email@example.com" required />
            </dd>
          </dl>
          <dl>
            <dt>パスワード</dt>
            <dd>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" name="password" placeholder="********" required />
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
