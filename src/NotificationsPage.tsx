import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markNotificationsRead } from "../utils/storage";
import type { Notification } from "../types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "только что";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  return `${Math.floor(hours / 24)} дн. назад`;
}

function notifIcon(type: Notification["type"]) {
  switch (type) {
    case "like": return "❤️";
    case "comment": return "💬";
    case "follow": return "👤";
    case "mention": return "@";
    default: return "🔔";
  }
}

function notifText(n: Notification) {
  switch (n.type) {
    case "like": return "оценил(а) ваш пост";
    case "comment": return "оставил(а) комментарий";
    case "follow": return "подписался(ась) на вас";
    case "mention": return "упомянул(а) вас";
    default: return "что-то сделал(а)";
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    setNotifications(getNotifications(user.id));
    markNotificationsRead(user.id);
  }, [user]);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Уведомления</h1>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <span className="text-5xl">🔔</span>
          <p className="mt-4 font-medium text-gray-400">Нет уведомлений</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              to={n.targetType === "post" ? `/?post=${n.targetId}` : "#"}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md ${
                n.read
                  ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20"
              }`}
            >
              <span className="text-2xl">{notifIcon(n.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-100">
                  <span className="font-semibold">{n.fromUsername}</span>{" "}
                  {notifText(n)}
                </p>
                <p className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 mt-2" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
