export const SERVICE_CATEGORY_IDS = [
  "mens",
  "womens",
  "spa",
  "massage",
  "eyebrow",
] as const;

export type ServiceCategoryId = (typeof SERVICE_CATEGORY_IDS)[number];

export function isServiceCategoryId(v: string): v is ServiceCategoryId {
  return (SERVICE_CATEGORY_IDS as readonly string[]).includes(v);
}

export const SERVICE_CATEGORY_LABELS: Record<
  ServiceCategoryId,
  { en: string; sk: string }
> = {
  mens: { en: "✂ Men's Grooming", sk: "✂ Pánsky grooming" },
  womens: { en: "♦ Women's Salon", sk: "♦ Dámsky salón" },
  spa: { en: "◈ Head Spa", sk: "◈ Head spa" },
  massage: { en: "❧ Body Massage", sk: "❧ Telová masáž" },
  eyebrow: { en: "◉ Eyebrow", sk: "◉ Obočie" },
};
