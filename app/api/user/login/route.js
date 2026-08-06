import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { SignJWT } from "jose"; 
import bcrypt from "bcryptjs";
import { userSchema } from "@/app/utils/schemas";


export async function POST(request) {
  const reqBody = await request.json() 
  try{ 
    const result = userSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
      }
    const {data, error} = await supabase.from("users") 
                  .select() 
                  .eq("email", result.data.email) 
                  .single() 
    if(!error){ 
      if(await bcrypt.compare(result.data.password, data.password_hash)){ 
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
        
        const payload = { 
          userId: data.id,
          email: result.data.email,
        }
        const token = await new SignJWT(payload) 
                            .setProtectedHeader({alg: "HS256"}) 
                            .setExpirationTime("3d")
                            .sign(secretKey) 
        return NextResponse.json({
                                  message: "ログイン成功",
                                  token: token
                                })
      }else{ 
        return NextResponse.json({message: "ログイン失敗：メールアドレスまたはパスワードが違います"}, {status: 401})
      }
    }else{
      return NextResponse.json({message: "ログイン失敗：メールアドレスまたはパスワードが違います"}, {status: 401})
    }
  }catch{
    return NextResponse.json({message: "ログイン失敗"}, {status: 500})
  }
}
