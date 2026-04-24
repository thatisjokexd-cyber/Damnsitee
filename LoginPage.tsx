import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Заполните все поля");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Ошибка входа");
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    loginAsGuest();
    setLoading(false);
    navigate("/");
  };

  return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-100">Damn</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Войдите в свой аккаунт</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Ник
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ваш ник"
            autoComplete="username"
            className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-800"
          />

          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
            placeholder="••••••"
            autoComplete="current-password"
            className="mb-5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-800"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-lg bg-gray-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            {loading ? "Вход..." : "Войти"}
          </button>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-gray-400 dark:text-gray-500">или</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="mt-3 w-full rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700/50"
          >
            👤 Войти как гость
          </button>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Нет аккаунта?{" "}
            <Link to="/register" className="font-semibold text-gray-600 hover:underline dark:text-gray-300">
              Зарегистрироваться
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
