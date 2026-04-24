import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password || !confirmPassword) {
      setError("Заполните все поля");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = register(username.trim(), password, confirmPassword);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Ошибка регистрации");
    }
  };

  return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-100">Damn</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Создайте новый аккаунт</p>
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
            className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-800"
          />
          <p className="-mt-2 mb-4 text-xs text-gray-400 dark:text-gray-500">
            Латинские буквы и цифры, без спецсимволов
          </p>

          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            autoComplete="new-password"
            className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-800"
          />

          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Повторите пароль
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
            autoComplete="new-password"
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent); }}
            className="mb-5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-800"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-lg bg-gray-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="font-semibold text-gray-600 hover:underline dark:text-gray-300">
              Войти
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
