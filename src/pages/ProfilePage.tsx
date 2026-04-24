import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  findUserByUsername,
  getUserPosts,
  isFollowing,
  toggleFollow,
  getFollowers,
  getFollowing,
  addNotification,
} from "../utils/storage";
import type { User, Post } from "../types";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Omit<User, "password"> | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [isCurrentFollowing, setIsCurrentFollowing] = useState(false);

  const loadData = () => {
    if (!username) {
      setNotFound(true);
      return;
    }
    const user = findUserByUsername(username);
    if (!user) {
      setNotFound(true);
      return;
    }
    const { password: _, ...profileData } = user;
    setProfile(profileData);
    setPosts(getUserPosts(user.id));
    setFollowers(getFollowers(user.id));
    setFollowing(getFollowing(user.id));
    if (currentUser && currentUser.id !== user.id) {
      setIsCurrentFollowing(isFollowing(currentUser.id, user.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [username, currentUser]);

  const refreshPosts = () => {
    if (profile) setPosts(getUserPosts(profile.id));
  };

  const handleFollowToggle = () => {
    if (!currentUser || !profile) return;
    const was = isFollowing(currentUser.id, profile.id);
    toggleFollow(currentUser.id, profile.id);
    if (!was && profile.id !== currentUser.id) {
      addNotification({
        userId: profile.id,
        type: "follow",
        fromUserId: currentUser.id,
        fromUsername: currentUser.username,
        targetId: currentUser.id,
        targetType: "post",
      });
    }
    loadData();
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Пользователь не найден
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Такого пользователя не существует
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          На главную
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
      </div>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isOwner = currentUser?.id === profile.id;
  const isGuest = profile.username.startsWith("guest_");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Profile Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-600 text-white text-2xl font-bold dark:bg-gray-500">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {profile.username}
              </h1>
              {isGuest && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  гость
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {profile.bio}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              На сайте с {memberSince}
            </p>
          </div>
          {!isOwner && !isGuest && (
            <button
              onClick={handleFollowToggle}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors active:scale-[0.98] ${
                isCurrentFollowing
                  ? "border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {isCurrentFollowing ? "Отписаться" : "Подписаться"}
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-6 border-t border-gray-100 pt-4 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {posts.length}
            </p>
            <p className="text-xs text-gray-400">постов</p>
          </div>
          <Link
            to={`/profile/${profile.username}/followers`}
            className="text-center hover:opacity-80"
          >
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {followers.length}
            </p>
            <p className="text-xs text-gray-400">подписчиков</p>
          </Link>
          <Link
            to={`/profile/${profile.username}/following`}
            className="text-center hover:opacity-80"
          >
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {following.length}
            </p>
            <p className="text-xs text-gray-400">подписок</p>
          </Link>
        </div>
      </div>

      {/* Posts */}
      <h2 className="mt-8 mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
        Посты{profile.username ? ` ${profile.username}` : ""}
      </h2>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="font-medium text-gray-400 dark:text-gray-500">Нет постов</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={refreshPosts} />
          ))
        )}
      </div>
    </div>
  );
}
