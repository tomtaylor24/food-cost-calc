import verifyToken from "@/app/utils/verifyToken";
import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

type Context = {
  params: Promise<{id: string}>
}

export async function DELETE(request: Request, context: Context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const params = await context.params
      const { error } = await supabase.from("categories")
        .delete()
        .eq("id", params.id)
        .eq("user_id", payload.userId)
      if (error) throw new Error(error.message)
      return NextResponse.json({ message: "カテゴリー削除成功" }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "カテゴリー削除失敗"}, { status: 500 })
    }
  }
}
