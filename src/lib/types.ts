export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
};

export type Account = SessionUser & {
  role: "owner" | "member";
};

export type ProductType =
  | "external_link"
  | "link"
  | "pdf"
  | "audio"
  | "youtube"
  | "vimeo"
  | "html";

export type ProductSummary = {
  id: string;
  moduleId: string;
  name: string;
  thumbnailUrl: string | null;
  type: ProductType;
  position: number;
};

export type Product = ProductSummary & {
  description: string;
  contentUrl: string;
  htmlContent: string;
};

export type ModuleSummary = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  position: number;
  hasAccess: boolean;
  purchaseUrl: string | null;
  releaseDate: string | null;
  daysRemaining: number | null;
  products: ProductSummary[];
};

export type PostAuthor = {
  name: string;
  email: string;
};

export type CommunityPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  isAuthor: boolean;
  author: PostAuthor;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  isAuthor: boolean;
  author: PostAuthor;
};

export type FeedPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
};
