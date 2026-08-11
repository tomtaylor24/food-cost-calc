import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().min(1, "食材名を入力してください"),
  purchasePrice: z.coerce.number().min(0, "仕入れ値は0以上にしてください"),
  purchaseQuantity: z.coerce.number().positive("仕入れ量は0より大きくしてください"),
  unit: z.enum(["g", "ml", "個"], "単位が不正です")
})

export const dishSchema = z.object({
  name: z.string().min(1, "商品名を入力してください"),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  sellingPrice: z.coerce.number().min(0, "販売価格は0以上にしてください"),
  rows: z.array(
    z.object({
      ingredientId: z.coerce.number().int().positive("食材を選択してください"),
      quantity: z.coerce.number().positive("使用量は0より大きくしてください")
    })
  ).min(1, "食材を1つ以上選んでください")
})

export const userSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上にしてください")
})

export const categorySchema = z.object({
  name: z.string().trim().min(1, "カテゴリー名を入力してください").max(20, "カテゴリー名は20文字以内にしてください")
})
