"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import useGuestOnly from "@/app/utils/useGuestOnly"
import { userSchema } from "@/app/utils/schemas"

type RegisterForm = z.infer<typeof userSchema>

const Register = () => {

  const router = useRouter()
  useGuestOnly()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(userSchema)
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await fetch("/api/user/register", {
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
        <h1 className="authTitle">会員登録</h1>
        <p className="authText">無料でアカウントを作成できます</p>
        <form className="authForm" onSubmit={handleSubmit(onSubmit)} noValidate>
          <dl>
            <dt><label htmlFor="register-email">メールアドレス</label></dt>
            <dd>
              <input id="register-email" {...register("email")} type="email" placeholder="email@example.com" autoComplete="email"
              aria-invalid={errors.email !== undefined} />
              {errors.email && <p className="formError">{errors.email.message}</p>}
            </dd>
          </dl>
          <dl>
            <dt><label htmlFor="register-password">パスワード</label></dt>
            <dd>
              <input id="register-password" {...register("password")} type="password" placeholder="********" autoComplete="new-password"
              aria-invalid={errors.password !== undefined} />
              {errors.password && <p className="formError">{errors.password.message}</p>}
            </dd>
          </dl>
          <button className="btn" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <span className="btnSpinner" aria-hidden="true" />}登録する
          </button>
        </form>
        <div className="authLink">すでにアカウントをお持ちの方は<Link href="/user/login">ログイン</Link></div>
      </div>
    </div>
  )
}

export default Register
