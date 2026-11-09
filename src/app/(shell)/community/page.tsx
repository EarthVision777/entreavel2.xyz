"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp, toast } from "@/components/app-provider";
import { Spinner } from "@/components/spinner";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { formatLongDate, formatShortDate } from "@/lib/media";
import type { Comment, CommunityPost } from "@/lib/types";

export default function CommunityPage() {
  const { theme, user } = useApp();
  const dark = theme === "dark";
  const [posts, setPosts] = useState<CommunityPost[] | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    api
      .listPosts()
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch(() => {
        if (!active) return;
        setPosts([]);
        toast.error(t("error_loading_posts"));
      });
    return () => {
      active = false;
    };
  }, []);

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  async function publish() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const created = await api.createPost(draft.trim());
      setPosts((current) => [created, ...(current ?? [])]);
      setDraft("");
      toast.success(t("post_created_successfully"));
    } catch {
      toast.error(t("error_creating_post"));
    } finally {
      setPosting(false);
    }
  }

  async function like(id: string) {
    try {
      const result = await api.toggleLike(id);
      setPosts((current) =>
        (current ?? []).map((post) =>
          post.id === id
            ? { ...post, likedByMe: result.liked, likesCount: result.likesCount }
            : post,
        ),
      );
    } catch {
      toast.error(t("error_liking_post"));
    }
  }

  async function removePost(id: string) {
    setBusy((current) => ({ ...current, [id]: true }));
    try {
      await api.deletePost(id);
      setPosts((current) => (current ?? []).filter((post) => post.id !== id));
      toast.success(t("post_deleted_successfully"));
    } catch {
      toast.error(t("error_deleting_post"));
    } finally {
      setBusy((current) => ({ ...current, [id]: false }));
    }
  }

  const toggleComments = useCallback(
    async (id: string) => {
      if (openId === id) {
        setOpenId(null);
        return;
      }
      setOpenId(id);
      if (comments[id]) return;
      try {
        const data = await api.listComments(id);
        setComments((current) => ({ ...current, [id]: data }));
      } catch {
        toast.error(t("error_loading_posts"));
      }
    },
    [comments, openId],
  );

  async function sendComment(id: string) {
    const content = commentDrafts[id]?.trim();
    if (!content) return;
    setBusy((current) => ({ ...current, [`c-${id}`]: true }));
    try {
      const created = await api.addComment(id, content);
      setComments((current) => ({
        ...current,
        [id]: [created, ...(current[id] ?? [])],
      }));
      setPosts((current) =>
        (current ?? []).map((post) =>
          post.id === id
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post,
        ),
      );
      setCommentDrafts((current) => ({ ...current, [id]: "" }));
      toast.success(t("comment_added_successfully"));
    } catch {
      toast.error(t("error_adding_comment"));
    } finally {
      setBusy((current) => ({ ...current, [`c-${id}`]: false }));
    }
  }

  async function removeComment(postId: string, commentId: string) {
    setBusy((current) => ({ ...current, [commentId]: true }));
    try {
      await api.deleteComment(postId, commentId);
      setComments((current) => ({
        ...current,
        [postId]: (current[postId] ?? []).filter((item) => item.id !== commentId),
      }));
      setPosts((current) =>
        (current ?? []).map((post) =>
          post.id === postId
            ? { ...post, commentsCount: Math.max(post.commentsCount - 1, 0) }
            : post,
        ),
      );
      toast.success(t("comment_deleted_successfully"));
    } catch {
      toast.error(t("error_deleting_comment"));
    } finally {
      setBusy((current) => ({ ...current, [commentId]: false }));
    }
  }

  if (posts === null) return <Spinner dark={dark} />;

  return (
    <div className="py-2">
      <h1 className={`mb-6 text-2xl font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>
        {t("community")}
      </h1>
      <div className={`mb-6 rounded-lg p-4 shadow ${dark ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex items-start gap-3">
          <Avatar letter={initial} />
          <div className="min-w-0 flex-1">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("what_are_you_thinking")}
              rows={2}
              className={`mb-2 min-h-16 resize-none ${dark ? "border-gray-600 bg-gray-700 text-gray-100" : ""}`}
            />
            <div className="flex justify-end">
              <Button
                onClick={publish}
                disabled={!draft.trim() || posting}
                className="h-auto bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {posting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send />
                )}
                {posting ? t("posting") : t("post")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {posts.length === 0 ? (
        <div className={`rounded-lg px-4 py-12 text-center shadow ${dark ? "bg-gray-800" : "bg-white"}`}>
          <MessageCircle className={`mx-auto mb-4 h-8 w-8 ${dark ? "text-gray-500" : "text-gray-400"}`} />
          <h3 className={`mb-1 text-lg font-medium ${dark ? "text-gray-100" : "text-gray-900"}`}>
            {t("no_posts_in_community")}
          </h3>
          <p className={dark ? "text-gray-400" : "text-gray-500"}>
            {t("be_the_first_to_post")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className={`overflow-hidden rounded-lg shadow ${dark ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="flex items-start gap-3 p-4">
                <Avatar letter={post.author.name.charAt(0).toUpperCase() || "?"} />
                <div className="min-w-0 flex-1">
                  <div className="post-author font-medium">{post.author.name}</div>
                  <div className="post-date text-sm">{formatLongDate(post.createdAt)}</div>
                  <p className={`community-content mt-2 break-words whitespace-pre-wrap ${dark ? "text-gray-200" : "text-gray-800"}`}>
                    {post.content}
                  </p>
                </div>
              </div>
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={t("post_image")}
                  className="w-full px-4 pb-4"
                />
              ) : null}
              <div className="flex items-center border-t border-gray-700/40 px-4 py-3">
                <button
                  type="button"
                  onClick={() => like(post.id)}
                  className={`mr-4 flex items-center gap-2 text-sm ${post.likedByMe ? "text-red-500" : "text-gray-500"}`}
                >
                  <Heart className={`h-5 w-5 ${post.likedByMe ? "fill-red-500" : ""}`} />
                  {post.likesCount}
                </button>
                <button
                  type="button"
                  onClick={() => toggleComments(post.id)}
                  className="mr-4 flex items-center gap-2 text-sm text-gray-500"
                >
                  <MessageCircle className="h-5 w-5" />
                  {post.commentsCount}
                </button>
                {post.isAuthor ? (
                  <button
                    type="button"
                    title={t("delete")}
                    onClick={() => removePost(post.id)}
                    disabled={busy[post.id]}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-950/40"
                  >
                    {busy[post.id] ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                ) : null}
              </div>
              {openId === post.id ? (
                <div className={`border-t px-4 py-4 ${dark ? "border-gray-600 bg-gray-700" : "border-gray-100 bg-gray-50"}`}>
                  <div className="mb-4 space-y-4">
                    {(comments[post.id] ?? []).length === 0 ? (
                      <p className="text-center text-sm text-gray-400">{t("no_comments_yet")}</p>
                    ) : (
                      comments[post.id].map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <Avatar letter={comment.author.email.charAt(0).toUpperCase()} small />
                          <div className="min-w-0 flex-1">
                            <div className={`rounded-lg p-3 shadow-sm ${dark ? "bg-gray-800" : "bg-white"}`}>
                              <div className="text-sm font-medium">{comment.author.email}</div>
                              <p className="mt-1 text-sm break-words whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                              <span>{formatShortDate(comment.createdAt)}</span>
                              {comment.isAuthor ? (
                                <button
                                  type="button"
                                  title={t("delete")}
                                  onClick={() => removeComment(post.id, comment.id)}
                                  className="text-red-500"
                                >
                                  {busy[comment.id] ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar letter={initial} small />
                    <div className="flex min-w-0 flex-1">
                      <Textarea
                        value={commentDrafts[post.id] ?? ""}
                        onChange={(event) =>
                          setCommentDrafts((current) => ({
                            ...current,
                            [post.id]: event.target.value,
                          }))
                        }
                        placeholder={t("write_a_comment")}
                        rows={1}
                        className={`min-h-10 flex-1 rounded-r-none ${dark ? "border-gray-600 bg-gray-800 text-gray-100" : ""}`}
                      />
                      <Button
                        onClick={() => sendComment(post.id)}
                        disabled={!commentDrafts[post.id]?.trim() || busy[`c-${post.id}`]}
                        className="h-auto rounded-l-none bg-blue-600 px-3 text-white hover:bg-blue-700"
                      >
                        {busy[`c-${post.id}`] ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Send />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Avatar({ letter, small = false }: { letter: string; small?: boolean }) {
  return (
    <div
      className={`avatar-container flex shrink-0 items-center justify-center overflow-hidden rounded-full ${small ? "h-8 w-8" : "h-10 w-10"}`}
    >
      <span className={`text-gray-500 ${small ? "text-sm" : "text-lg"}`}>{letter}</span>
    </div>
  );
}
