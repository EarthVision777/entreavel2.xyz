import "server-only";

import catalogData from "@/data/catalog.json";
import type { Account, ModuleSummary, Product } from "@/lib/types";

type CatalogProduct = Product;
type CatalogModule = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  position: number;
  purchaseUrl: string | null;
  releaseDate: string | null;
  products: CatalogProduct[];
};

const catalog = catalogData as CatalogModule[];

export function listCatalog(): CatalogModule[] {
  return catalog;
}

export function findProduct(id: string) {
  for (const entry of catalog) {
    const product = entry.products.find((item) => item.id === id);
    if (product) return { module: entry, product };
  }
  return null;
}

export function presentModule(
  user: Account,
  entry: CatalogModule,
): ModuleSummary {
  let hasAccess = user.role === "owner";
  let daysRemaining: number | null = null;

  if (!hasAccess && entry.releaseDate) {
    const release = new Date(entry.releaseDate).getTime();
    if (release > Date.now()) {
      daysRemaining = Math.max(1, Math.ceil((release - Date.now()) / 86_400_000));
    }
  }

  if (!hasAccess && daysRemaining === null && !entry.purchaseUrl) {
    hasAccess = true;
  }

  return {
    id: entry.id,
    name: entry.name,
    thumbnailUrl: entry.thumbnailUrl,
    position: entry.position,
    hasAccess,
    purchaseUrl: entry.purchaseUrl,
    releaseDate: entry.releaseDate,
    daysRemaining,
    products: [...entry.products]
      .sort((a, b) => a.position - b.position)
      .map((product) => ({
        id: product.id,
        moduleId: product.moduleId,
        name: product.name,
        thumbnailUrl: product.thumbnailUrl,
        type: product.type,
        position: product.position,
      })),
  };
}
