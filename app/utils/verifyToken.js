import { jwtVerify } from "jose"

const verifyToken = async (request) => {
  const token = await request.headers.get("Authorization")?.split(" ")[1]
  if (!token) {
    return null
  }
  try{
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
    const {payload} = await jwtVerify(token, secretKey)
    return payload
  }catch{
    return null
  }
}

export default verifyToken
