"use client"
import { useState } from "react"
import styles from "./register.module.scss"
import Link from "next/link"
import {useRouter} from "next/navigation"
import toast from "react-hot-toast"


const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/user/register", {
        method: "POST", 
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password
        })
      })
      const jsonData = await response.json()
      if(response.ok){
        toast.success(jsonData.message)
        router.push("/")
      }else{
        toast.error(jsonData.message)
      }
    } catch {
      toast.error(jsonData.message)
    }
  }

  return (
    <div className="auth">
      <div className="inner">
        <h1 className="authTitle">会員登録</h1>
        <p className="authText">無料でアカウントを作成できます</p>
        <form className="authForm" onSubmit={handleSubmit}>
          <dl>
            <dt>名前</dt>
            <dd>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" name="name" placeholder="田中 太郎" required />
            </dd>
          </dl>
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
          <button className="btn">登録する</button>
        </form>
        <div className="authLink">すでにアカウントをお持ちの方は<Link href="/user/login">ログイン</Link></div>
      </div>
    </div>
  )
}

export default Register
