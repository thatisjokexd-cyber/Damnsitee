import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { getFollowers, getFollowing } from "../utils/storage";
import type { User } from "../types";

export default function FollowListPage() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const type = location.pathname.includes("/followers") ? "followers" : "following";

  const [userIds, setUserIds] = useState<string[]>([]);
  const [profileUser, setProfileUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    if (!username) return;
    // get profile user
    const allUsers = JSON.parse(localStorage.getItem("damn-users") || "[]") as User[];
    const u = allUsers.find((u) => u.username === username);
    if (u) setProfileUser(u);
    const ids = type === "followers" ? getFollowers(u?.id || "") : getFollowing(u?.id || "");
    setUserIds(ids);
  }, [username, type]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={`/profile/${username}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {profileUser?.username || username}
          </h1>
          <p className="text-sm text-gray-400">
            {type === "followers" ? "Подписчики" : "Подписки"}
          </p>
        </div>
      </div>

      {userIds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="font-medium text-gray-400">
            {type === "followers" ? "Нет подписчиков" : "Нет подписок"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {userIds.map((id) => {
            const allUsers = JSON.parse(localStorage.getItem("damn-users") || "[]") as User[];
            const u = allUsers.find((u) => u.id === id);
            if (!u) return null;
            return (
              <Link
                key={id}
                to={`/profile/${u.username}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-white text-sm font-bold dark:bg-gray-500">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{u.username}</p>
                  {u.bio && <p className="text-xs text-gray-400">{u.bio}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}