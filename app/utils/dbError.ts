import type { PostgrestError } from "@supabase/supabase-js"

const UNIQUE_VIOLATION = "23505"

const extractConstraint = (message: string) => {
  const matched = message.match(/constraint "([^"]+)"/)
  return matched === null ? null : matched[1]
}

export class DbError extends Error {
  code: string
  constraint: string | null

  constructor(error: PostgrestError) {
    super(error.message)
    this.name = "DbError"
    this.code = error.code
    this.constraint = extractConstraint(error.message)
  }
}

export const isUniqueViolation = (error: unknown, constraintIncludes?: string) => {
  if (!(error instanceof DbError)) return false
  if (error.code !== UNIQUE_VIOLATION) return false
  if (constraintIncludes === undefined) return true
  return error.constraint !== null && error.constraint.includes(constraintIncludes)
}
