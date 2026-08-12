import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import bcrypt from "bcryptjs";
import { userSchema } from "@/app/utils/schemas";
import { issueToken } from "@/app/utils/jwt";
import readJson from "@/app/utils/readJson";
import type { User } from "@/app/types";

export async function POST(request: Request) {
  try{
    const reqBody = await readJson(request)
    if (reqBody === null) {
    return NextResponse.json({ message: "リクエストの形式が正しくありません" }, { status: 400 })
    }
    const result = userSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
      }
    const {data, error} = await supabase.from("users") 
                  .select() 
                  .eq("email", result.data.email) 
                  .single() 
    if(!error){
      const user = data as User
      if(await bcrypt.compare(result.data.password, user.password_hash)){
        const token = await issueToken(user.id, result.data.email)
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
