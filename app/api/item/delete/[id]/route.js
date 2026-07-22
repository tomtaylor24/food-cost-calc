import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function DELETE (request, context) { // ↓DELETE=削除が行われたときの処理↓
  const reqBody = await request.json()
  const params = await context.params
  try{
    const {data, error} = await supabase.from("foods").select().eq("id", params.id).single()
    if(error) throw new Error(error.message)
    if(data.email === reqBody.email){
      const {error} = await supabase.from("foods") //テーブルの指定
                    .delete() //指示
                    .eq("id", params.id) //条件 テーブルのidがparamsのidと等しいもの
      if(error) throw new Error(error.message)
      return NextResponse.json({message: "アイテム削除成功"})
  }else{
      return NextResponse.json({message: "他の人が作成したアイテムです"})
    }
  }catch(err){
    return NextResponse.json({message: `アイテム削除失敗: ${err}`})
  }

}
