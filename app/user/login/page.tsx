"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { userSchema } from "@/app/utils/schemas"
import useGuestOnly from "@/app/utils/useGuestOnly"

type LoginForm = z.infer<typeof userSchema>

const Login = () => {
  const router = useRouter()
  useGuestOnly()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(userSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
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
        <form className="authForm" onSubmit={handleSubmit(onSubmit)} noValidate>
          <dl>
            <dt><label htmlFor="login-email">メールアドレス</label></dt>
            <dd>
              <input id="login-email" {...register("email")} type="email" placeholder="email@example.com" autoComplete="username" aria-invalid={errors.email !== undefined} />
              {errors.email && <p className="formError">{errors.email.message}</p>}
            </dd>
          </dl>
          <dl>
            <dt><label htmlFor="login-password">パスワード</label></dt>
            <dd>
              <input id="login-password" {...register("password")} type="password" autoComplete="current-password" placeholder="********" aria-invalid={errors.password !== undefined} />
              {errors.password && <p className="formError">{errors.password.message}</p>}
            </dd>
          </dl>
          <button className="btn" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <span className="btnSpinner" aria-hidden="true" />}ログイン
          </button>
        </form>
        <div className="authLink">アカウントをお持ちでない方は<Link href="/user/register">会員登録</Link></div>
        <div className="authLink authLinkSub"><Link href="/user/forgot-password">パスワードをお忘れの方</Link></div>
      </div>
    </div>
  )
}

export default Login
