import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { SignJWT } from "jose"; // トークンを発行するためのもの

export async function POST(request) {
  const reqBody = await request.json() // メールアドレス取得のため
  try{ //↓すでにユーザー登録済みかを調べるための処理
    const {data, error} = await supabase.from("users") // テーブルの指定
                  .select() // テーブルすべてのデータを取り出す
                  .eq("email", reqBody.email) // テーブルのemailがreqBodyのemailと等しい
                  .single() // オブジェクトで返す
    if(!error){ // エラーでない = ユーザー登録済みの場合
      if(reqBody.password === data.password){ // パスワードが合っている場合
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
        //↑TextEncoder().encode(文字) = 文字列をシークレットキーの形式に変換↑
        const payload = { // payload=トークンのデータ、 一般的にユーザー名やメールアドレス
          email: reqBody.email,
        }
        const token = await new SignJWT(payload) //トークンに入れる中身、この場合はpayload=email
                            .setProtectedHeader({alg: "HS256"}) // 署名の方式
                            .setExpirationTime("1d") // トークンお有効期限
                            .sign(secretKey) // secretKeyでsign(署名)
        return NextResponse.json({
                                  message: "ログイン成功",
                                  token: token
                                })
      }else{ // パスワードが間違えている場合
        return NextResponse.json({message: "ログイン失敗：パスワードが間違っています"})
      }
    }else{ // エラー = ユーザー登録をしていない
      return NextResponse.json({message: "ログイン失敗：ユーザー登録をしてください"})
    }
  }catch{
    return NextResponse.json({message: "ログイン失敗"})
  }
}
