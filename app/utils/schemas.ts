import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().trim().min(1, "食材名を入力してください").max(30, "食材名は30文字以内にしてください"),
  nameKana: z.string().trim().max(50, "読み方は50文字以内にしてください").nullable().default(null),
  purchasePrice: z.coerce.number().min(0, "仕入れ値は0以上にしてください"),
  purchaseQuantity: z.coerce.number().positive("仕入れ量は0より大きくしてください"),
  unit: z.string().trim().min(1, "単位を入力してください").max(10, "単位は10文字以内にしてください"),
  yieldRate: z.coerce.number().positive("歩留まりは0より大きくしてください").max(100, "歩留まりは100%以下にしてください").default(100),
  taxAddRate: z.coerce.number().refine((rate) => [0, 8, 10].includes(rate), "税率が正しくありません").default(0),
  supplier: z.string().trim().max(50, "仕入先は50文字以内にしてください").nullable().default(null),
  note: z.string().trim().max(500, "備考は500文字以内にしてください").nullable().default(null)
})

export const ingredientFormSchema = z.object({
  name: z.string().trim().min(1, "食材名を入力してください").max(30, "食材名は30文字以内にしてください"),
  nameKana: z.string().trim().max(50, "読み方は50文字以内にしてください"),
  purchasePrice: z.string().trim().min(1, "仕入れ値を入力してください")
    .refine((value) => Number(value) >= 0, "仕入れ値は0以上にしてください"),
  purchaseQuantity: z.string().trim().min(1, "仕入れ量を入力してください")
    .refine((value) => Number(value) > 0, "仕入れ量は0より大きくしてください"),
  unit: z.string().trim().min(1, "単位を入力してください").max(10, "単位は10文字以内にしてください"),
  isTaxExcluded: z.boolean(),
  taxAddRate: z.string(),
  hasYield: z.boolean(),
  yieldRate: z.string(),
  supplier: z.string().trim().max(50, "仕入先は50文字以内にしてください"),
  note: z.string().trim().max(500, "備考は500文字以内にしてください")
}).superRefine((data, ctx) => {
  if (!data.hasYield) return
  const rate = Number(data.yieldRate)
  if (data.yieldRate.trim() === "" || !Number.isFinite(rate) || rate <= 0 || rate > 100) {
    ctx.addIssue({
      code: "custom",
      message: "歩留まりは1〜100で入力してください",
      path: ["yieldRate"]
    })
  }
})

export const dishSchema = z.object({
  name: z.string().trim().min(1, "商品名を入力してください").max(30, "商品名は30文字以内にしてください"),
  categoryIds: z.array(z.coerce.number().int().positive()).max(20, "カテゴリーは20個以内にしてください").optional().default([]),
  sellingPrice: z.coerce.number().min(0, "販売価格は0以上にしてください").nullable(),
  note: z.string().trim().max(500, "備考は500文字以内にしてください").nullable().default(null),
  rows: z.array(
    z.object({
      ingredientId: z.coerce.number().int().positive("食材を選択してください"),
      quantity: z.coerce.number().positive("使用量は0より大きくしてください")
    })
  ).min(1, "食材を1つ以上選んでください")
})

export const dishFormSchema = z.object({
  name: z.string().trim().min(1, "商品名を入力してください").max(30, "商品名は30文字以内にしてください"),
  sellingPrice: z.string(),
  categoryIds: z.array(z.string()).max(20, "カテゴリーは20個以内にしてください"),
  note: z.string().trim().max(500, "備考は500文字以内にしてください"),
  rows: z.array(z.object({
    ingredientId: z.string().min(1, "食材を選択してください"),
    quantity: z.string().trim().min(1, "使用量を入力してください")
      .refine((value) => Number(value) > 0, "使用量は0より大きくしてください")
  })).min(1, "食材を1つ以上選んでください")
}).superRefine((data, ctx) => {
  if (data.sellingPrice.trim() !== "" && !(Number(data.sellingPrice) >= 0)) {
    ctx.addIssue({
      code: "custom",
      message: "販売価格は0以上にしてください",
      path: ["sellingPrice"]
    })
  }

  const seenIds: string[] = []
  data.rows.forEach((row, index) => {
    if (row.ingredientId === "") return
    if (seenIds.includes(row.ingredientId)) {
      ctx.addIssue({
        code: "custom",
        message: "同じ食材が複数の行で選ばれています",
        path: ["rows", index, "ingredientId"]
      })
    }
    seenIds.push(row.ingredientId)
  })
})

export const userSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上にしてください")
})

export const forgotPasswordSchema = userSchema.pick({ email: true })

export const resetPasswordSchema = userSchema.pick({ password: true })

export const categorySchema = z.object({
  name: z.string().trim().min(1, "カテゴリー名を入力してください").max(20, "カテゴリー名は20文字以内にしてください")
})
