import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { decodeJwt } from "jose"

const useGuestOnly = () => {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const payload = decodeJwt(token)
      if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token")
        return
      }
      router.push("/dishes")
    } catch {
      localStorage.removeItem("token")
    }
  }, [router])
}

export default useGuestOnly
