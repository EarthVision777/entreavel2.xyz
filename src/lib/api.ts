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

const sessionKey = "llama.session";

export type Session = {
  token: string;
  user: SessionUser;
};

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(sessionKey);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(sessionKey);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = readSession()?.token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
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
  login: (email: string) =>
    request<Session>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
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
