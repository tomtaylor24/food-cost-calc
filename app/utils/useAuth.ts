import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { decodeJwt } from "jose"

const useAuth = () => {
  const [loginUserEmail, setLoginUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/user/login")
        return
      }


      try {
        const payload = decodeJwt(token)
        if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token")
          router.push("/user/login")
          return
        }
        if (typeof payload.email === "string") {
          setLoginUserEmail(payload.email)
        } else {
          router.push("/user/login")
        }
      } catch{
        router.push("/user/login")
      }
    }
    checkToken()
  }, [router])

  return loginUserEmail
}

export default useAuth
