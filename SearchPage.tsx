import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  searchUsers,
  searchPosts,
  searchByHashtag,
} from "../utils/storage";
import type { User, Post } from "../types";
import PostCard from "../components/PostCard";

type Tab = "users" | "posts" | "tags";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTag = searchParams.get("tag") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [tag, setTag] = useState(initialTag);
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const doSearch = useCallback(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
      setUsers(searchUsers(debouncedQuery));
      setPosts(searchPosts(debouncedQuery));
      setTab("users");
    } else if (tag) {
      setSearchParams({ tag });
      setPosts(searchByHashtag(tag));
      setTab("tags");
    } else {
      setUsers([]);
      setPosts([]);
    }
    setHasSearched(true);
  }, [debouncedQuery, tag]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTag("");
    doSearch();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Поиск</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск пользователей и постов..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-gray-600 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Найти
          </button>
        </div>
      </form>

      {/* Hashtag from post click */}
      {tag && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Метка:</span>
          <Link
            to={`/search?tag=${tag}`}
            className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-200 transition-colors"
          >
            #{tag}
          </Link>
          <button
            onClick={() => setTag("")}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      {debouncedQuery && (
        <div className="mb-4 flex gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800 w-fit">
          {(["users", "posts"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-gray-600 text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {t === "users" ? `Люди${users.length ? ` (${users.length})` : ""}` : `Посты${posts.length ? ` (${posts.length})` : ""}`}
            </button>
          ))}
        </div>
      )}

      {!hasSearched ? (
        <div className="py-20 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="mt-4 font-medium text-gray-400">Введите запрос для поиска</p>
        </div>
      ) : tab === "users" ? (
        users.length > 0 ? (
          <div className="space-y-3">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-white text-sm font-bold dark:bg-gray-500">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{u.username}</p>
                  {u.bio && <p className="text-xs text-gray-400 mt-0.5">{u.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-medium text-gray-400">Ничего не найдено</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={doSearch} />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="font-medium text-gray-400">Ничего не найдено</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}