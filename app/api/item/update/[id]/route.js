import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function PUT (request, context) { // ↓PUT=修正が行われたときの処理↓
  const reqBody = await request.json() // 修正する元データのためが必要なため
  const params = await context.params // どのデータが必要か見つけるため
  try{
    const {data, error} = await supabase.from("foods")
                                        .select()
                                        .eq("id", params.id)
                                        .single()
    if(error) throw new Error(error.message)
    if(data.email === reqBody.email){
      const {error} = await supabase.from("foods") // テーブルの指定
                    .update(reqBody) // 内容を指定
                    .eq("id", params.id) // テーブルのidとparamsのidが等しいものを指定
      if(error) throw new Error(error.message)
      return NextResponse.json({message: "アイテム修正成功"})
    }else{
      return NextResponse.json({message: "他の人が作成したアイテムです"})
    }
  }catch(err){
    return NextResponse.json({message: `アイテム修正失敗: ${err}`})
  }
}
