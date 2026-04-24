import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserBookmarks } from "../utils/storage";
import type { Post } from "../types";
import PostCard from "../components/PostCard";

export default function SavedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  const loadBookmarks = () => {
    if (!user) return;
    setPosts(getUserBookmarks(user.id));
  };

  useEffect(() => {
    loadBookmarks();
  }, [user]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors hover:bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Сохранённое</h1>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <span className="text-5xl">📌</span>
          <p className="mt-4 font-medium text-gray-400">Нет сохранённых постов</p>
          <p className="mt-1 text-sm text-gray-300">Нажмите на 🔖 под постом, чтобы сохранить его</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={loadBookmarks} />
          ))}
        </div>
      )}
    </div>
  );
}