import { supabase } from "../supabaseClient";

export type UICategory = { id: string; slug: string | null; name: string; sort: number };
export type UIProduct = {
  id: string;
  categoryId: string | null;
  title: string;
  description?: string | null;
  price: number;
  available: boolean;
};

const toNumber = (n: any) => (n == null ? 0 : typeof n === "number" ? n : Number(n));

/** 读取分类（带多语名） */
export async function getCategories(lang: "zh-TW" | "en" = "zh-TW"): Promise<UICategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, sort_order, category_translations(name, lang_code)")
    .eq("is_published", true)
    .eq("category_translations.lang_code", lang)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug ?? null,
    sort: row.sort_order ?? 0,
    name: row.category_translations?.[0]?.name ?? "(未命名)",
  }));
}

/** 读取产品（按分类，可选） */
export async function getProductsByCategory(
  categoryId?: string,
  lang: "zh-TW" | "en" = "zh-TW"
): Promise<UIProduct[]> {
  let q = supabase
    .from("products")
    .select("id, category_id, base_price, is_available, product_translations(title, description, lang_code)")
    .eq("is_published", true)
    .eq("product_translations.lang_code", lang);

  if (categoryId) q = q.eq("category_id", categoryId);

  const { data, error } = await q.order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    categoryId: row.category_id ?? null,
    title: row.product_translations?.[0]?.title ?? "(未命名商品)",
    description: row.product_translations?.[0]?.description ?? null,
    price: toNumber(row.base_price),
    available: !!row.is_available,
  }));
}
