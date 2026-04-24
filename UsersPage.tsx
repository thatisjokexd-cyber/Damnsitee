import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, getUserPosts, getFollowers, getFollowing } from "../utils/storage";
import type { User } from "../types";

type SortMode = "posts" | "followers" | "newest";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sort, setSort] = useState<SortMode>("posts");

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  const sorted = [...users].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const aPosts = getUserPosts(a.id).length;
    const bPosts = getUserPosts(b.id).length;
    const aFollowers = getFollowers(a.id).length;
    const bFollowers = getFollowers(b.id).length;
    if (sort === "posts") return bPosts - aPosts;
    return bFollowers - aFollowers;
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Пользователи</h1>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {([
            { key: "posts", label: "Постам" },
            { key: "followers", label: "Подписчикам" },
            { key: "newest", label: "Новые" },
          ] as { key: SortMode; label: string }[]).map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                sort === s.key
                  ? "bg-gray-600 text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-medium text-gray-400">Нет пользователей</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((u) => {
            const postCount = getUserPosts(u.id).length;
            const followerCount = getFollowers(u.id).length;
            const followingCount = getFollowing(u.id).length;
            const isGuest = u.username.startsWith("guest_");

            return (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-600 text-white text-sm font-bold dark:bg-gray-500">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{u.username}</p>
                    {isGuest && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        гость
                      </span>
                    )}
                  </div>
                  {u.bio && (
                    <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{u.bio}</p>
                  )}
                  <div className="mt-1 flex gap-4 text-xs text-gray-400">
                    <span>📝 {postCount}</span>
                    <span>👥 {followerCount}</span>
                    <span>📤 {followingCount}</span>
                  </div>
                </div>
                <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}