export type Category = { id: string; slug: string; name: string; sort: number };
export type Product = {
  id: string;
  categoryId: string;
  sku: string;
  title: string;
  description?: string;
  price: number;
  image?: string | null;
  available: boolean;
};

export const categories: Category[] = [
  { id: "c_rice", slug: "rice", name: "飯類", sort: 1 },
  { id: "c_noodles", slug: "noodles", name: "麵類", sort: 2 },
  { id: "c_snacks", slug: "snacks", name: "小吃", sort: 3 },
  { id: "c_drinks", slug: "drinks", name: "飲品", sort: 4 },
];

export const products: Product[] = [
  {
    id: "p_rice_1",
    categoryId: "c_rice",
    sku: "RICE001",
    title: "日式咖哩豬排飯",
    description: "香濃咖哩配酥脆豬排",
    price: 120,
    image: null,
    available: true,
  },
  {
    id: "p_rice_2",
    categoryId: "c_rice",
    sku: "RICE002",
    title: "照燒雞排飯",
    description: "甜鹹適口的照燒雞排",
    price: 150,
    image: null,
    available: true,
  },
  {
    id: "p_drink_1",
    categoryId: "c_drinks",
    sku: "DRK001",
    title: "抹茶拿鐵",
    description: "香濃順口",
    price: 60,
    image: null,
    available: true,
  },
  {
    id: "p_snack_1",
    categoryId: "c_snacks",
    sku: "SNK001",
    title: "唐揚炸雞",
    description: "外酥裡嫩",
    price: 80,
    image: null,
    available: false, // 示範售罄
  },
];

export const byCategory = (catId?: string) =>
  products.filter((p) => (catId ? p.categoryId === catId : true));
