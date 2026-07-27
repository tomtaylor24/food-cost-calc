import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { jwtVerify } from "jose"

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
        const secretKey = new TextEncoder().encode("food-cost-calc-route-handlers") //後ほど変更
        const decodedJwt = await jwtVerify(token, secretKey)
        setLoginUserEmail(decodedJwt.payload.email)
      }catch(error){
        router.push("/user/login")
      }
    }
    checkToken()
  }, [router])

  return loginUserEmail
}


export default useAuth
