import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export const dynamic = "force-dynamic"

export async function GET () { // ↓GET=取得が行われたときの処理↓
  try{
    const { data, error } = await supabase
                     .from("foods") // テーブルを指定
                     .select() // fromで指定したテーブルを返す
    if(error) throw new Error(error.message)
    return NextResponse.json({
                              message: "アイテム読み取り成功（オール）",
                              allItems: data // 取得したデータの表示
                            })
  }catch(err){
    return NextResponse.json({message: `アイテム読み取り失敗（オール）: ${err}`})
  }
}
