import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/app/utils/db";
import verifyToken from "@/app/utils/verifyToken";
import { categorySchema } from "@/app/utils/schemas";
import readJson from "@/app/utils/readJson";
import type { Category } from "@/app/types";
import { isDuplicateEntry } from "@/app/utils/dbError";

type CategoryRow = Category & RowDataPacket

export async function POST(request: Request) {
  const payload = await verifyToken(request)

  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const reqBody = await readJson(request)
      if (reqBody === null) {
        return NextResponse.json({ message: "リクエストの形式が正しくありません" }, { status: 400 })
      }
      const result = categorySchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json(
          { message: result.error.issues[0].message },
          { status: 400 }
        )
      }
      const [inserted] = await pool.execute<ResultSetHeader>(
        "INSERT INTO categories (user_id, name) VALUES (?, ?)",
        [payload.userId, result.data.name]
      )
      const [rows] = await pool.query<CategoryRow[]>(
        "SELECT id, user_id, name, created_at FROM categories WHERE id = ?",
        [inserted.insertId]
      )
      return NextResponse.json({
        message: "カテゴリー登録成功",
        category: rows[0]
      }, { status: 201 })
    } catch (error) {
      if (isDuplicateEntry(error)) {
        return NextResponse.json({ message: "同じ名前のカテゴリーが既に登録されています" }, { status: 400 })
      }
      console.log(error)
      return NextResponse.json({ message: "カテゴリー登録に失敗しました" }, { status: 500 })
    }
  }
}


export async function GET(request: Request) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const [rows] = await pool.query<CategoryRow[]>(
        "SELECT id, user_id, name, created_at FROM categories WHERE user_id = ? ORDER BY name",
        [payload.userId]
      )
      return NextResponse.json({
        message: "カテゴリー一覧の取得成功",
        categories: rows
      },
        { status: 200 }
      )
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "カテゴリー一覧の取得失敗" }, { status: 500 })
    }
  }
}
