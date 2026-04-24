import { useState, useEffect, useCallback } from "react";
import { getPosts, getFollows } from "../utils/storage";
import type { Post } from "../types";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

type FeedMode = "all" | "following";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<FeedMode>("all");

  const loadPosts = useCallback(() => {
    const all = getPosts();
    const userId = JSON.parse(localStorage.getItem("damn-current-user") || "{}")?.id;
    if (mode === "following" && userId) {
      const following = getFollows()
        .filter((f) => f.followerId === userId)
        .map((f) => f.followingId);
      setPosts(all.filter((p) => p.userId === userId || following.includes(p.userId)));
    } else {
      setPosts(all);
    }
  }, [mode]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <CreatePost onPostCreated={loadPosts} />

      {/* Feed mode tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800 w-fit">
        <button
          onClick={() => { setMode("all"); }}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "all"
              ? "bg-gray-600 text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Все
        </button>
        <button
          onClick={() => { setMode("following"); }}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "following"
              ? "bg-gray-600 text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Подписки
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="mt-4 font-medium text-gray-400">
              {mode === "following" ? "Нет постов от подписок" : "Пока нет постов"}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {mode === "following" ? "Подпишитесь на кого-нибудь!" : "Опубликуйте первый пост!"}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={loadPosts} />
          ))
        )}
      </div>
    </div>
  );
}