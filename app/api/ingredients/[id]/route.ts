import verifyToken from "@/app/utils/verifyToken";
import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/app/utils/db";
import { ingredientSchema } from "@/app/utils/schemas";
import readJson from "@/app/utils/readJson";
import type { Ingredient, PriceHistoryRow } from "@/app/types";
import { isDuplicateEntry, isStillReferenced } from "@/app/utils/dbError";

type Context = {
  params: Promise<{ id: string }>
}

type IngredientWithCountRow = Ingredient & RowDataPacket & {
  used_count: number
}

type PriceSnapshotRow = RowDataPacket & {
  purchase_price: number
  purchase_quantity: number
  yield_rate: number
  tax_add_rate: number
}

type HistoryRow = PriceHistoryRow & RowDataPacket

export async function GET(request: Request, context: Context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const params = await context.params
      // 使用件数はサブクエリで一緒に取る。UI がこの件数で削除ボタンを disabled にする
      const [rows] = await pool.query<IngredientWithCountRow[]>(
        `SELECT i.id, i.user_id, i.name, i.name_kana, i.purchase_price, i.purchase_quantity,
                i.unit, i.yield_rate, i.tax_add_rate, i.supplier, i.note, i.created_at,
                (SELECT COUNT(*) FROM dish_ingredients di WHERE di.ingredient_id = i.id) AS used_count
         FROM ingredients i
         WHERE i.id = ? AND i.user_id = ?`,
        [params.id, payload.userId]
      )
      if (rows.length === 0) {
        return NextResponse.json({ message: "食材が見つかりません" }, { status: 404 })
      }
      const { used_count, ...ingredient } = rows[0]

      const [history] = await pool.query<HistoryRow[]>(
        `SELECT id, purchase_price, purchase_quantity, yield_rate, tax_add_rate, changed_at
         FROM ingredient_price_history
         WHERE ingredient_id = ?
         ORDER BY changed_at DESC
         LIMIT 10`,
        [params.id]
      )

      return NextResponse.json({
        message: "食材詳細取得成功",
        ingredient: {
          ...ingredient,
          dish_ingredients: [{ count: used_count }],
          ingredient_price_history: history
        }
      }, { status: 200 })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ message: "食材の取得に失敗しました" }, { status: 500 })
    }
  }
}

export async function PUT(request: Request, context: Context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const reqBody = await readJson(request)
      if (reqBody === null) {
        return NextResponse.json({ message: "リクエストの形式が正しくありません" }, { status: 400 })
      }
      const params = await context.params
      const result = ingredientSchema.safeParse(reqBody)
      if (!result.success) {
        return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
      }

      // 更新前の値を控える。価格まわりが変わったときだけ履歴を残すため
      const [oldRows] = await pool.query<PriceSnapshotRow[]>(
        `SELECT purchase_price, purchase_quantity, yield_rate, tax_add_rate
         FROM ingredients
         WHERE id = ? AND user_id = ?`,
        [params.id, payload.userId]
      )
      if (oldRows.length === 0) {
        return NextResponse.json({ message: "食材が見つかりません" }, { status: 404 })
      }
      const previous = oldRows[0]

      await pool.execute<ResultSetHeader>(
        `UPDATE ingredients
         SET name = ?, name_kana = ?, purchase_price = ?, purchase_quantity = ?,
             unit = ?, yield_rate = ?, tax_add_rate = ?, supplier = ?, note = ?
         WHERE id = ? AND user_id = ?`,
        [
          result.data.name,
          result.data.nameKana,
          result.data.purchasePrice,
          result.data.purchaseQuantity,
          result.data.unit,
          result.data.yieldRate,
          result.data.taxAddRate,
          result.data.supplier,
          result.data.note,
          params.id,
          payload.userId
        ]
      )

      const isPriceChanged =
        previous.purchase_price !== result.data.purchasePrice ||
        previous.purchase_quantity !== result.data.purchaseQuantity ||
        previous.yield_rate !== result.data.yieldRate ||
        previous.tax_add_rate !== result.data.taxAddRate

      if (isPriceChanged) {
        // 履歴は失敗しても編集自体は成功として扱う
        try {
          await pool.execute(
            `INSERT INTO ingredient_price_history
               (ingredient_id, purchase_price, purchase_quantity, yield_rate, tax_add_rate)
             VALUES (?, ?, ?, ?, ?)`,
            [
              params.id,
              result.data.purchasePrice,
              result.data.purchaseQuantity,
              result.data.yieldRate,
              result.data.taxAddRate
            ]
          )
        } catch (historyError) {
          console.log(historyError)
        }
      }

      return NextResponse.json({ message: "食材編集成功" }, { status: 200 })
    } catch (error) {
      if (isDuplicateEntry(error)) {
        return NextResponse.json({ message: "同じ名前の食材が既に登録されています" }, { status: 400 })
      }
      console.log(error)
      return NextResponse.json({ message: "食材編集に失敗しました" }, { status: 500 })
    }
  }
}

export async function DELETE(request: Request, context: Context) {
  const payload = await verifyToken(request)
  if (!payload) {
    return NextResponse.json({ message: "トークンが有効ではありません" }, { status: 401 })
  } else {
    try {
      const params = await context.params
      const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM ingredients WHERE id = ? AND user_id = ?",
        [params.id, payload.userId]
      )
      if (result.affectedRows === 0) {
        return NextResponse.json({ message: "食材が見つかりません" }, { status: 404 })
      }
      return NextResponse.json({ message: "食材削除成功" }, { status: 200 })
    } catch (error) {
      // ON DELETE RESTRICT により、使用中の食材は DB 側で削除が止まる
      if (isStillReferenced(error)) {
        return NextResponse.json({ message: "この食材は商品で使われているため削除できません" }, { status: 400 })
      }
      console.log(error)
      return NextResponse.json({ message: "食材の削除に失敗しました" }, { status: 500 })
    }
  }
}
