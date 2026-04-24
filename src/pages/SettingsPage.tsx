import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Theme } from "../types";

export default function SettingsPage() {
  const { user, logout, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [bioEdit, setBioEdit] = useState(false);
  const [bio, setBio] = useState(
    (user as { bio?: string } | null)?.bio || ""
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((r) => setTimeout(r, 200));
    logout();
    navigate("/login");
  };

  const handleBioSave = () => {
    import("../utils/storage").then(({ updateUserBio }) => {
      if (user) updateUserBio(user.id, bio);
      const stored = JSON.parse(localStorage.getItem("damn-current-user") || "{}");
      if (stored) {
        stored.bio = bio;
        localStorage.setItem("damn-current-user", JSON.stringify(stored));
      }
    });
    setBioEdit(false);
  };

  const memberSince = user
    ? new Date(user.createdAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const isGuest = user?.username.startsWith("guest_") ?? false;

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      {/* Back + title */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Настройки</h1>
      </div>

      {/* Account */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 dark:bg-gray-700/50 dark:border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Аккаунт</p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-600 text-white text-lg font-bold dark:bg-gray-500">
              {user!.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-gray-800 dark:text-gray-100">{user!.username}</p>
              {isGuest && (
                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  гость
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-400">На сайте с {memberSince}</p>

          {!isGuest && (
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
              {!bioEdit ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">О себе</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {(user as { bio?: string } | null)?.bio || "Не указано"}
                  </p>
                  <button
                    onClick={() => {
                      setBio((user as { bio?: string } | null)?.bio || "");
                      setBioEdit(true);
                    }}
                    className="mt-2 text-xs text-blue-500 hover:underline"
                  >
                    Изменить
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">О себе</p>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 150))}
                    rows={3}
                    maxLength={150}
                    placeholder="Расскажите о себе..."
                    className="mb-2 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{bio.length}/150</span>
                    <div className="flex gap-2">
                      <button onClick={handleBioSave} className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors">
                        Сохранить
                      </button>
                      <button onClick={() => setBioEdit(false)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 dark:bg-gray-700/50 dark:border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Оформление</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Тема</p>
              <p className="mt-0.5 text-sm text-gray-400">Внешний вид приложения</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  theme === t
                    ? "border-gray-600 bg-gray-600 text-white"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {t === "light" ? "☀️ Светлая" : t === "dark" ? "🌙 Тёмная" : "💻 Системная"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Saved */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 dark:bg-gray-700/50 dark:border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Навигация</p>
        </div>
        <div className="p-3">
          <Link
            to="/saved"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            Сохранённые посты
          </Link>
          <Link
            to="/users"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Все пользователи
          </Link>
          <Link
            to="/notifications"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            Уведомления
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-900/30 dark:bg-gray-800">
        <div className="bg-red-50 px-5 py-3 border-b border-red-100 dark:bg-red-900/20 dark:border-red-900/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Выход</p>
        </div>
        <div className="p-5">
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full rounded-lg border border-red-200 bg-white py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 active:scale-[0.99] dark:border-red-900/30 dark:hover:bg-red-900/20"
            >
              Выйти из аккаунта
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Вы уверены, что хотите выйти?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoggingOut ? "Выход..." : "Да, выйти"}
                </button>
                <button
                  onClick={() => { setShowLogoutConfirm(false); setIsLoggingOut(false); }}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 active:scale-[0.99] dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
