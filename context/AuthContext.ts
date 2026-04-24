import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User, Theme } from "../types";
import {
  findUserByUsername,
  createUser,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getTheme,
  setTheme as saveTheme,
  applyTheme,
} from "../utils/storage";

type AuthUser = Omit<User, "password">;

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (
    username: string,
    password: string,
    confirmPassword: string
  ) => { success: boolean; error?: string };
  loginAsGuest: () => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateGuestName(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `guest_${suffix}`;
}

function createGuestUser(): Omit<User, "password"> {
  return createUser(generateGuestName(), crypto.randomUUID());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [theme, setThemeState] = useState<Theme>(() => getTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(theme);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const refreshUser = useCallback(() => {
    const stored = getCurrentUser();
    if (stored) setUser(stored);
  }, []);

  const login = useCallback((username: string, password: string) => {
    const found = findUserByUsername(username);
    if (!found) return { success: false, error: "Пользователь не найден" };
    if (found.password !== password)
      return { success: false, error: "Неверный пароль" };
    const { password: _, ...rest } = found;
    sessionStorage.removeItem("damn-viewed");
    setUser(rest);
    setCurrentUser(rest);
    return { success: true };
  }, []);

  const register = useCallback(
    (username: string, password: string, confirmPassword: string) => {
      if (!/^[a-zA-Z0-9]+$/.test(username))
        return { success: false, error: "Только латинские буквы и цифры" };
      if (username.length < 2)
        return { success: false, error: "Ник минимум 2 символа" };
      if (password.length < 6)
        return { success: false, error: "Пароль минимум 6 символов" };
      if (password !== confirmPassword)
        return { success: false, error: "Пароли не совпадают" };
      if (findUserByUsername(username))
        return { success: false, error: "Такой ник уже занят" };
      const newUser = createUser(username, password);
      sessionStorage.removeItem("damn-viewed");
      setUser(newUser);
      setCurrentUser(newUser);
      return { success: true };
    },
    []
  );

  const loginAsGuest = useCallback(() => {
    sessionStorage.removeItem("damn-viewed");
    const guest = createGuestUser();
    setUser(guest);
    setCurrentUser(guest);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("damn-viewed");
    setUser(null);
    clearCurrentUser();
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      saveTheme(t);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        theme,
        setTheme,
        login,
        register,
        loginAsGuest,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
