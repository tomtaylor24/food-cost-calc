import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request){ // ↓POST=作成が行われたときの処理↓
  const reqBody = await request.json() // フロントから届いたデータ(request)をjson形式に変えてreqBodyに代入
  try{
    const { error } = await supabase
                      .from("foods") // テーブル名の指定
                      .insert(reqBody) // 書き込みたいデータの指定
    if (error) throw new Error(error.message) // errorがあればcatchにerror.messageを渡す
    return NextResponse.json({message: "アイテム作成成功"})
  }catch(err){
    return NextResponse.json({message: `アイテム作成失敗: ${err}`})
  }

}

