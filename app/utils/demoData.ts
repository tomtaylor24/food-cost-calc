export const DEMO_CATEGORIES = ["定食", "丼もの", "麺類", "洋食", "一品料理", "ドリンク", "ランチ", "おすすめ"]

export const DEMO_INGREDIENTS = [
  { name: "鶏もも肉", purchase_price: 880, purchase_quantity: 1000, unit: "g" },
  { name: "豚バラ肉", purchase_price: 1200, purchase_quantity: 1000, unit: "g" },
  { name: "豚ロース肉", purchase_price: 1400, purchase_quantity: 1000, unit: "g" },
  { name: "合いびき肉", purchase_price: 1180, purchase_quantity: 1000, unit: "g" },
  { name: "ベーコン", purchase_price: 1600, purchase_quantity: 1000, unit: "g" },
  { name: "さば切り身", purchase_price: 1200, purchase_quantity: 1000, unit: "g" },
  { name: "えび", purchase_price: 1800, purchase_quantity: 20, unit: "尾" },
  { name: "玉ねぎ", purchase_price: 300, purchase_quantity: 1000, unit: "g" },
  { name: "じゃがいも", purchase_price: 350, purchase_quantity: 1000, unit: "g" },
  { name: "にんじん", purchase_price: 320, purchase_quantity: 1000, unit: "g" },
  { name: "キャベツ", purchase_price: 220, purchase_quantity: 1000, unit: "g" },
  { name: "長ねぎ", purchase_price: 700, purchase_quantity: 1000, unit: "g" },
  { name: "きゅうり", purchase_price: 400, purchase_quantity: 1000, unit: "g" },
  { name: "ピーマン", purchase_price: 600, purchase_quantity: 1000, unit: "g" },
  { name: "しょうが", purchase_price: 900, purchase_quantity: 1000, unit: "g" },
  { name: "冷凍枝豆", purchase_price: 600, purchase_quantity: 1000, unit: "g" },
  { name: "米", purchase_price: 2800, purchase_quantity: 5000, unit: "g" },
  { name: "スパゲッティ", purchase_price: 320, purchase_quantity: 1000, unit: "g" },
  { name: "中華麺", purchase_price: 1600, purchase_quantity: 20, unit: "玉" },
  { name: "冷凍うどん", purchase_price: 1800, purchase_quantity: 20, unit: "玉" },
  { name: "小麦粉", purchase_price: 220, purchase_quantity: 1000, unit: "g" },
  { name: "片栗粉", purchase_price: 300, purchase_quantity: 1000, unit: "g" },
  { name: "パン粉", purchase_price: 400, purchase_quantity: 1000, unit: "g" },
  { name: "卵", purchase_price: 280, purchase_quantity: 10, unit: "個" },
  { name: "牛乳", purchase_price: 220, purchase_quantity: 1000, unit: "ml" },
  { name: "生クリーム", purchase_price: 1200, purchase_quantity: 1000, unit: "ml" },
  { name: "バター", purchase_price: 1100, purchase_quantity: 450, unit: "g" },
  { name: "粉チーズ", purchase_price: 3800, purchase_quantity: 1000, unit: "g" },
  { name: "醤油", purchase_price: 700, purchase_quantity: 1800, unit: "ml" },
  { name: "みりん", purchase_price: 800, purchase_quantity: 1800, unit: "ml" },
  { name: "味噌", purchase_price: 600, purchase_quantity: 1000, unit: "g" },
  { name: "砂糖", purchase_price: 250, purchase_quantity: 1000, unit: "g" },
  { name: "サラダ油", purchase_price: 380, purchase_quantity: 1000, unit: "ml" },
  { name: "ケチャップ", purchase_price: 450, purchase_quantity: 1000, unit: "g" },
  { name: "マヨネーズ", purchase_price: 600, purchase_quantity: 1000, unit: "g" },
  { name: "顆粒だし", purchase_price: 1400, purchase_quantity: 1000, unit: "g" },
  { name: "生ビール樽", purchase_price: 12000, purchase_quantity: 19000, unit: "ml" },
  { name: "ウイスキー", purchase_price: 3200, purchase_quantity: 1920, unit: "ml" },
  { name: "炭酸水", purchase_price: 80, purchase_quantity: 1000, unit: "ml" },
  { name: "コーヒー豆", purchase_price: 2200, purchase_quantity: 1000, unit: "g" }
]

export const DEMO_DISHES = [
  {
    name: "唐揚げ定食",
    selling_price: 1080,
    categories: ["定食", "ランチ", "おすすめ"],
    items: [
      { ingredient: "鶏もも肉", quantity: 200 },
      { ingredient: "米", quantity: 250 },
      { ingredient: "キャベツ", quantity: 80 },
      { ingredient: "片栗粉", quantity: 20 },
      { ingredient: "小麦粉", quantity: 10 },
      { ingredient: "サラダ油", quantity: 25 },
      { ingredient: "醤油", quantity: 12 },
      { ingredient: "しょうが", quantity: 5 },
      { ingredient: "味噌", quantity: 15 },
      { ingredient: "顆粒だし", quantity: 2 },
      { ingredient: "玉ねぎ", quantity: 20 }
    ]
  },
  {
    name: "生姜焼き定食",
    selling_price: 1180,
    categories: ["定食", "ランチ"],
    items: [
      { ingredient: "豚ロース肉", quantity: 150 },
      { ingredient: "米", quantity: 250 },
      { ingredient: "キャベツ", quantity: 80 },
      { ingredient: "玉ねぎ", quantity: 50 },
      { ingredient: "しょうが", quantity: 8 },
      { ingredient: "醤油", quantity: 15 },
      { ingredient: "みりん", quantity: 15 },
      { ingredient: "サラダ油", quantity: 10 },
      { ingredient: "味噌", quantity: 15 },
      { ingredient: "顆粒だし", quantity: 2 }
    ]
  },
  {
    name: "鯖の味噌煮定食",
    selling_price: 1180,
    categories: ["定食"],
    items: [
      { ingredient: "さば切り身", quantity: 120 },
      { ingredient: "米", quantity: 250 },
      { ingredient: "しょうが", quantity: 5 },
      { ingredient: "味噌", quantity: 30 },
      { ingredient: "砂糖", quantity: 10 },
      { ingredient: "みりん", quantity: 20 },
      { ingredient: "キャベツ", quantity: 60 },
      { ingredient: "顆粒だし", quantity: 2 },
      { ingredient: "玉ねぎ", quantity: 20 }
    ]
  },
  {
    name: "ハンバーグ定食",
    selling_price: 1280,
    categories: ["定食"],
    items: [
      { ingredient: "合いびき肉", quantity: 150 },
      { ingredient: "玉ねぎ", quantity: 60 },
      { ingredient: "パン粉", quantity: 20 },
      { ingredient: "卵", quantity: 1 },
      { ingredient: "牛乳", quantity: 20 },
      { ingredient: "バター", quantity: 10 },
      { ingredient: "ケチャップ", quantity: 25 },
      { ingredient: "醤油", quantity: 10 },
      { ingredient: "米", quantity: 250 },
      { ingredient: "にんじん", quantity: 30 },
      { ingredient: "じゃがいも", quantity: 50 },
      { ingredient: "サラダ油", quantity: 10 },
      { ingredient: "味噌", quantity: 15 },
      { ingredient: "顆粒だし", quantity: 2 }
    ]
  },
  {
    name: "親子丼",
    selling_price: 980,
    categories: ["丼もの", "ランチ"],
    items: [
      { ingredient: "鶏もも肉", quantity: 120 },
      { ingredient: "卵", quantity: 2 },
      { ingredient: "玉ねぎ", quantity: 60 },
      { ingredient: "米", quantity: 300 },
      { ingredient: "醤油", quantity: 20 },
      { ingredient: "みりん", quantity: 20 },
      { ingredient: "砂糖", quantity: 5 },
      { ingredient: "顆粒だし", quantity: 3 },
      { ingredient: "長ねぎ", quantity: 10 }
    ]
  },
  {
    name: "カツ丼",
    selling_price: 1180,
    categories: ["丼もの"],
    items: [
      { ingredient: "豚ロース肉", quantity: 120 },
      { ingredient: "卵", quantity: 2 },
      { ingredient: "玉ねぎ", quantity: 60 },
      { ingredient: "米", quantity: 300 },
      { ingredient: "パン粉", quantity: 30 },
      { ingredient: "小麦粉", quantity: 15 },
      { ingredient: "サラダ油", quantity: 40 },
      { ingredient: "醤油", quantity: 20 },
      { ingredient: "みりん", quantity: 20 },
      { ingredient: "砂糖", quantity: 5 },
      { ingredient: "顆粒だし", quantity: 3 }
    ]
  },
  {
    name: "醤油ラーメン",
    selling_price: 880,
    categories: ["麺類", "ランチ"],
    items: [
      { ingredient: "中華麺", quantity: 1 },
      { ingredient: "豚バラ肉", quantity: 60 },
      { ingredient: "卵", quantity: 1 },
      { ingredient: "長ねぎ", quantity: 15 },
      { ingredient: "醤油", quantity: 25 },
      { ingredient: "顆粒だし", quantity: 5 },
      { ingredient: "サラダ油", quantity: 5 }
    ]
  },
  {
    name: "肉うどん",
    selling_price: 780,
    categories: ["麺類"],
    items: [
      { ingredient: "冷凍うどん", quantity: 1 },
      { ingredient: "豚バラ肉", quantity: 60 },
      { ingredient: "長ねぎ", quantity: 15 },
      { ingredient: "醤油", quantity: 20 },
      { ingredient: "みりん", quantity: 15 },
      { ingredient: "砂糖", quantity: 5 },
      { ingredient: "顆粒だし", quantity: 5 }
    ]
  },
  {
    name: "ナポリタン",
    selling_price: 880,
    categories: ["洋食", "ランチ"],
    items: [
      { ingredient: "スパゲッティ", quantity: 120 },
      { ingredient: "ベーコン", quantity: 40 },
      { ingredient: "玉ねぎ", quantity: 50 },
      { ingredient: "ピーマン", quantity: 30 },
      { ingredient: "ケチャップ", quantity: 60 },
      { ingredient: "バター", quantity: 10 },
      { ingredient: "粉チーズ", quantity: 5 }
    ]
  },
  {
    name: "カルボナーラ",
    selling_price: 1180,
    categories: ["洋食", "おすすめ"],
    items: [
      { ingredient: "スパゲッティ", quantity: 120 },
      { ingredient: "ベーコン", quantity: 60 },
      { ingredient: "生クリーム", quantity: 60 },
      { ingredient: "卵", quantity: 1 },
      { ingredient: "粉チーズ", quantity: 20 },
      { ingredient: "バター", quantity: 5 }
    ]
  },
  {
    name: "オムライス",
    selling_price: 1080,
    categories: ["洋食"],
    items: [
      { ingredient: "卵", quantity: 3 },
      { ingredient: "米", quantity: 280 },
      { ingredient: "鶏もも肉", quantity: 80 },
      { ingredient: "玉ねぎ", quantity: 50 },
      { ingredient: "ケチャップ", quantity: 50 },
      { ingredient: "バター", quantity: 15 },
      { ingredient: "サラダ油", quantity: 5 }
    ]
  },
  {
    name: "エビフライ",
    selling_price: 1280,
    categories: ["洋食", "おすすめ"],
    items: [
      { ingredient: "えび", quantity: 3 },
      { ingredient: "パン粉", quantity: 40 },
      { ingredient: "小麦粉", quantity: 20 },
      { ingredient: "卵", quantity: 1 },
      { ingredient: "サラダ油", quantity: 50 },
      { ingredient: "キャベツ", quantity: 80 },
      { ingredient: "マヨネーズ", quantity: 20 }
    ]
  },
  {
    name: "ポテトサラダ",
    selling_price: 420,
    categories: ["一品料理"],
    items: [
      { ingredient: "じゃがいも", quantity: 120 },
      { ingredient: "きゅうり", quantity: 20 },
      { ingredient: "にんじん", quantity: 20 },
      { ingredient: "玉ねぎ", quantity: 15 },
      { ingredient: "マヨネーズ", quantity: 35 },
      { ingredient: "卵", quantity: 1 }
    ]
  },
  {
    name: "だし巻き卵",
    selling_price: 480,
    categories: ["一品料理"],
    items: [
      { ingredient: "卵", quantity: 3 },
      { ingredient: "顆粒だし", quantity: 3 },
      { ingredient: "醤油", quantity: 5 },
      { ingredient: "みりん", quantity: 5 },
      { ingredient: "サラダ油", quantity: 5 }
    ]
  },
  {
    name: "枝豆",
    selling_price: 380,
    categories: ["一品料理"],
    items: [
      { ingredient: "冷凍枝豆", quantity: 120 }
    ]
  },
  {
    name: "生ビール(中)",
    selling_price: 580,
    categories: ["ドリンク", "おすすめ"],
    items: [
      { ingredient: "生ビール樽", quantity: 350 }
    ]
  },
  {
    name: "ハイボール",
    selling_price: 480,
    categories: ["ドリンク"],
    items: [
      { ingredient: "ウイスキー", quantity: 30 },
      { ingredient: "炭酸水", quantity: 120 }
    ]
  },
  {
    name: "コーヒー",
    selling_price: 420,
    categories: ["ドリンク"],
    items: [
      { ingredient: "コーヒー豆", quantity: 12 }
    ]
  }
]
