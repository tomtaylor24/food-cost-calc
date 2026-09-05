import { jwtVerify } from "jose"
import { secretKey } from "@/app/utils/jwt"

type Payload = {
  userId: string,
  email: string
}

const verifyToken = async (request: Request): Promise<Payload | null> => {
  const token = request.headers.get("Authorization")?.split(" ")[1]
  if (!token) {
    return null
  }
  try{
    const {payload} = await jwtVerify(token, secretKey)
    if(typeof payload.userId !== "string" || typeof payload.email !== "string"){
      return null
    }
    return {
      userId: payload.userId,
      email: payload.email
    }
  }catch(error){
    console.error("JWTの検証に失敗しました", error)
    return null
  }
}

export default verifyToken
