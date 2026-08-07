import { jwtVerify } from "jose"

const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error("JWT_SECRET が .env に設定されていません")
}

const verifyToken = async (request: Request) => {
  const token = await request.headers.get("Authorization")?.split(" ")[1]
  if (!token) {
    return null
  }
  try{
    const secretKey = new TextEncoder().encode(jwtSecret)
    const {payload} = await jwtVerify(token, secretKey)
    return payload
  }catch{
    return null
  }
}

export default verifyToken
