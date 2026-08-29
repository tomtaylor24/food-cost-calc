// mysql2 が投げるエラーは errno に MySQL のエラー番号が入っている。
const DUPLICATE_ENTRY = 1062
const FK_ON_INSERT = 1452
const FK_ON_DELETE = 1451
const CHECK_VIOLATION = 3819

type MysqlError = {
  errno: number
  message: string
}

const isMysqlError = (error: unknown): error is MysqlError => {
  if (typeof error !== "object" || error === null) return false
  return "errno" in error && typeof (error as MysqlError).errno === "number"
}

// 重複エラーのメッセージには制約名が入るため、どの一意制約に当たったかを見分けられる。
// 例: Duplicate entry '3-7' for key 'dish_ingredients.dish_ingredients_dish_id_ingredient_id_key'
export const isDuplicateEntry = (error: unknown, keyIncludes?: string) => {
  if (!isMysqlError(error)) return false
  if (error.errno !== DUPLICATE_ENTRY) return false
  if (keyIncludes === undefined) return true
  return error.message.includes(keyIncludes)
}

// 参照先が存在しない（INSERT / UPDATE 時）
export const isMissingReference = (error: unknown) => {
  if (!isMysqlError(error)) return false
  return error.errno === FK_ON_INSERT
}

// 使用中のため削除できない（ON DELETE RESTRICT）
export const isStillReferenced = (error: unknown) => {
  if (!isMysqlError(error)) return false
  return error.errno === FK_ON_DELETE
}

export const isCheckViolation = (error: unknown) => {
  if (!isMysqlError(error)) return false
  return error.errno === CHECK_VIOLATION
}
