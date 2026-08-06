import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if(!supabaseUrl){
  throw new Error("supabaseUrlが.envに設定されていません")
}

if(!supabaseKey){
  throw new Error("supabaseKetが.envに設定されていません")
}

const supabase = createClient(
  supabaseUrl, supabaseKey
)

export default supabase
