"use client";

import { useEffect, useState } from "react";
import { useApp, toast } from "@/components/app-provider";
import { Spinner } from "@/components/spinner";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { formatLongDate } from "@/lib/media";
import type { FeedPost } from "@/lib/types";

export default function FeedPage() {
  const { theme } = useApp();
  const dark = theme === "dark";
  const [posts, setPosts] = useState<FeedPost[] | null>(null);

  useEffect(() => {
    let active = true;
    api
      .listFeed()
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch(() => {
        if (!active) return;
        setPosts([]);
        toast.error(t("error_loading_feed"));
      });
    return () => {
      active = false;
    };
  }, []);

  if (posts === null) return <Spinner dark={dark} />;

  return (
    <div className="py-2">
      <h1 className={`mb-8 text-2xl font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>
        {t("feed_updates")}
      </h1>
      {posts.length === 0 ? (
        <div
          className={`rounded-xl border px-4 py-16 text-center shadow-sm ${dark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-white"}`}
        >
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${dark ? "bg-gray-700" : "bg-gray-50"}`}
          >
            <svg
              className={`h-8 w-8 ${dark ? "text-gray-500" : "text-gray-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className={`mb-1 text-lg font-medium ${dark ? "text-gray-100" : "text-gray-900"}`}>
            {t("no_posts_yet")}
          </h3>
          <p className={dark ? "text-gray-400" : "text-gray-500"}>
            {t("updates_will_appear_here")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className={`overflow-hidden rounded-xl border shadow-sm ${dark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-white"}`}
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={t("post_image")}
                  className="max-h-64 w-full object-cover"
                />
              ) : null}
              <div className="p-4">
                <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {formatLongDate(post.createdAt)}
                </p>
                <p className={`mt-2 whitespace-pre-wrap ${dark ? "text-gray-100" : "text-gray-800"}`}>
                  {post.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
