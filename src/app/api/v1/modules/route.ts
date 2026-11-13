import { listCatalog, presentModule } from "@/lib/catalog";
import { ok } from "@/lib/http";

export async function GET() {
  const modules = listCatalog()
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((module) => presentModule(module));
  return ok(modules);
}
