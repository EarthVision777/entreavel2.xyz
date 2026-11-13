import type {
  Comment,
  CommunityPost,
  FeedPost,
  ModuleSummary,
  Product,
  SessionUser,
} from "@/lib/types";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`/api/v1${path}`, { ...init, headers });
  let payload: { data?: T; error?: { code?: string; message?: string } } | null =
    null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.code ?? "INTERNAL",
      payload?.error?.message ?? "Falha na requisição",
      response.status,
    );
  }
  return payload?.data as T;
}

export const api = {
  login: () =>
    request<SessionUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  me: () => request<SessionUser>("/me"),
  logout: () => request<null>("/me", { method: "DELETE" }),
  updateName: (name: string) =>
    request<SessionUser>("/me", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
  listModules: () => request<ModuleSummary[]>("/modules"),
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  listFeed: () => request<FeedPost[]>("/feed"),
  listPosts: () => request<CommunityPost[]>("/community/posts"),
  createPost: (content: string) =>
    request<CommunityPost>("/community/posts", {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  deletePost: (id: string) =>
    request<null>(`/community/posts/${id}`, { method: "DELETE" }),
  toggleLike: (id: string) =>
    request<{ liked: boolean; likesCount: number }>(
      `/community/posts/${id}/likes`,
      { method: "POST" },
    ),
  listComments: (id: string) =>
    request<Comment[]>(`/community/posts/${id}/comments`),
  addComment: (id: string, content: string) =>
    request<Comment>(`/community/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  deleteComment: (postId: string, commentId: string) =>
    request<null>(`/community/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }),
};
