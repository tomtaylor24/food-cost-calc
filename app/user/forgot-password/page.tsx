"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import useGuestOnly from "@/app/utils/useGuestOnly"
import { forgotPasswordSchema } from "@/app/utils/schemas"

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

const ForgotPassword = () => {
  const router = useRouter()
  useGuestOnly()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const response = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      const jsonData = await response.json()
      if (response.ok) {
        toast.success(jsonData.message)
        router.push("/user/login")
      } else {
        toast.error(jsonData.message)
      }
    }
    catch {
      toast.error("通信に失敗しました")
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
        <form className="authForm" onSubmit={handleSubmit(onSubmit)} noValidate>
          <dl>
            <dt><label htmlFor="forgot-email">メールアドレス</label></dt>
            <dd>
              <input id="forgot-email" {...register("email")} type="email" placeholder="email@example.com" autoComplete="email"
                aria-invalid={errors.email !== undefined} />
              {errors.email && <p className="formError">{errors.email.message}</p>}
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
