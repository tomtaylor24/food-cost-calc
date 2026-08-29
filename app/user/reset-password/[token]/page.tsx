"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import useGuestOnly from "@/app/utils/useGuestOnly"
import { resetPasswordSchema } from "@/app/utils/schemas"

type Props = {
  params: Promise<{ token: string }>
}

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

const ResetPassword = (context: Props) => {
  const router = useRouter()
  useGuestOnly()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      const params = await context.params
      const response = await fetch(`/api/user/reset-password/${params.token}`, {
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
        <h1 className="authTitle">新しいパスワードを設定</h1>
        <p className="authText">8文字以上のパスワードを入力してください</p>
        <form className="authForm" onSubmit={handleSubmit(onSubmit)} noValidate>
          <dl>
            <dt><label htmlFor="reset-password">新しいパスワード</label></dt>
            <dd>
              <input id="reset-password" {...register("password")} type="password" placeholder="********" autoComplete="new-password" aria-invalid={errors.password !== undefined} />
              {errors.password && <p className="formError">{errors.password.message}</p>}
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
