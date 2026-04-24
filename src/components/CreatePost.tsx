import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../utils/storage";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || !user) return;
    createPost(user.id, user.username, trimmed);
    setContent("");
    setIsExpanded(false);
    onPostCreated();
  };

  const handleFocus = () => {
    setIsExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-white text-sm font-bold dark:bg-gray-500">
          {user!.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            placeholder="Что у вас нового?"
            rows={isExpanded ? 3 : 1}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-400 dark:focus:bg-gray-800 dark:focus:ring-gray-400/20"
          />
          {isExpanded && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {content.length}/2000
              </span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="rounded-lg bg-gray-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-500 dark:hover:bg-gray-600"
              >
                Опубликовать
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
