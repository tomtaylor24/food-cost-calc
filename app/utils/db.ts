import mysql from "mysql2/promise"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URLが.envに設定されていません")
}

const rawCaCert = process.env.DATABASE_CA_CERT
const caCert = rawCaCert
  ? rawCaCert.includes("-----BEGIN")
    ? rawCaCert.replace(/\\n/g, "\n")
    : Buffer.from(rawCaCert, "base64").toString("utf8")
  : undefined

// decimalNumbers: DECIMAL 型を文字列ではなく数値で受け取る。
// 既定では '880.00' のような文字列で返るため、原価計算で意図しない文字列連結が起きる。
const pool = mysql.createPool({
  uri: databaseUrl,
  decimalNumbers: true,
  timezone: "Z",
  connectionLimit: 3,
  ...(caCert ? { ssl: { ca: caCert } } : {})
})

export default pool
