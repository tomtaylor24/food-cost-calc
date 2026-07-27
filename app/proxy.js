// ユーザーのログイン状態を判定する機能
//トークンが有効か→有効期限が切れていないか→トークンが存在しているか

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy (request) {
  const token = await request.headers.get("Authorization")?.split(" ")[1] // トークンの取得
  
  if(!token){ //トークンがない場合の処理
    return NextResponse.json({message: "トークンがありません"})
  }
  
  try{ // トークンがある場合
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
    const decodedJwt = await jwtVerify(token, secretKey)
    //↑ログインのrequestに含まれるtokenとsecretKeyが合致するか確認↑
    return NextResponse.next()
  }catch{ // トークンが正しくない場合
    return NextResponse.json({message: "トークンが正しくないので、ログインしてください"})
  }  
}

export const config = {
  matcher: ["/api/item/create", "/api/item/update/:path*", "/api/item/delete/:path*"],
}
// ファイルの適用範囲を制限
// 作成=create, 編集=update, 削除=deleteで適用
// :path* = 該当フォルダに含まれるすべてのフォルダとファイルに適用
