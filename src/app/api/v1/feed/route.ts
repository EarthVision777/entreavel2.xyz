import { sql } from "@/lib/db";
import { ok } from "@/lib/http";

export async function GET() {
  const rows = await sql<{
    id: string;
    content: string;
    imageUrl: string | null;
    createdAt: Date | string;
  }>(
    `select id, content, image_url as "imageUrl", created_at as "createdAt"
     from feed_posts
     order by created_at desc`,
  );
  return ok(
    rows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
    })),
  );
}
