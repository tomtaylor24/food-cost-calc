import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function GET(request, context) {
  //↓GET=取得が行われたときの処理↓
  //context = 動的ルート([id])の値が入る 例えばidなど
  const params = await context.params // paramsにcontextのparamsを代入
  try {
    const { data, error} = await supabase.from("foods") // テーブルを選択
                  .select() // foodsのすべてを取り出し
                  .eq("id", params.id) //テーブルのidがparamsのidと等しいもののみ
                  .single() // オブジェクトで返す、かつ、0件の場合にはエラーを返す
    if (error) throw new Error(error.message)
    return NextResponse.json({ 
                              message: "アイテム読み取り成功（シングル）",
                              singleItem: data
                            })
  } catch (err) {
    return NextResponse.json({ message: `アイテム読み取り失敗（シングル）: ${err}` })
  }
}
