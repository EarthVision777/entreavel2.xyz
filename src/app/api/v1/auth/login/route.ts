import { ok, requireUser } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  return ok(auth.user);
}
