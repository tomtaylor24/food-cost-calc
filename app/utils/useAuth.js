import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { decodeJwt } from "jose"

const useAuth = () => {
  const [loginUserEmail, setLoginUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkToken = async() => {
      const token = localStorage.getItem("token")
    
      if(!token){
        router.push("/user/login")
      }
    
      try{
        const payload = decodeJwt(token)
        setLoginUserEmail(payload.email)
      }catch(error){
        router.push("/user/login")
      }
    }
    checkToken()
  }, [router])

  return loginUserEmail
}

export default useAuth
