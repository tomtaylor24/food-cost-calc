import { jwtVerify } from "jose"

type Payload = {
  userId: string,
  email: string
}

const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error("JWT_SECRET が .env に設定されていません")
}

const verifyToken = async (request: Request): Promise<Payload | null> => {
  const token = request.headers.get("Authorization")?.split(" ")[1]
  if (!token) {
    return null
  }
  try{
    const secretKey = new TextEncoder().encode(jwtSecret)
    const {payload} = await jwtVerify(token, secretKey)
    if(typeof payload.userId !== "string" || typeof payload.email !== "string"){
      return null
    }
    return {
      userId: payload.userId,
      email: payload.email
    }
  }catch{
    return null
  }
}

export default verifyToken
