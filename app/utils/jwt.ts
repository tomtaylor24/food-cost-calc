import { SignJWT } from "jose"

const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error("JWT_SECRET が .env に設定されていません")
}

export const secretKey = new TextEncoder().encode(jwtSecret)

export const issueToken = (userId: string, email: string) => {
  return new SignJWT({ 
    userId: userId,
    email: email
    })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("3d")
    .sign(secretKey)
}
