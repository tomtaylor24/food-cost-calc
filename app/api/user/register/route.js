import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const reqBody = await request.json()
  const hashedPassword = await bcrypt.hash(reqBody.password, 10)
  try{
    const {error} = await supabase.from("users")
                                  .insert({
                                    email: reqBody.email,
                                    password_hash: hashedPassword
                                  })
    if (error) throw new Error(error.message)
    return NextResponse.json({message: "ユーザー登録成功"})
}catch(err){
    return NextResponse.json({message: `ユーザー登録失敗: ${err}`})
  }
}
