import type { Model } from "mongoose";

export function slugify(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "item"
  );
}

/** A slug that is not yet taken in `model`: base, base-2, base-3, … */
export async function uniqueSlug(model: Model<{ slug: string }>, base: string): Promise<string> {
  const root = slugify(base);
  for (let n = 1; n < 1000; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    if (!(await model.exists({ slug: candidate }))) return candidate;
  }
  throw new Error("Could not generate a unique slug");
}
