import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Post, Comment } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  toggleReaction,
  toggleBookmark,
  isBookmarked,
  getPostComments,
  createComment,
  deleteComment,
  deletePost,
  toggleCommentLike,
  incrementViews,
  addNotification,
  updatePost,
  createQuotePost,
} from "../utils/storage";

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

const REACTIONS = [
  { emoji: "❤️", label: "Любовь" },
  { emoji: "😂", label: "Хаха" },
  { emoji: "😮", label: "Вау" },
  { emoji: "😢", label: "Грусть" },
  { emoji: "😡", label: "Злость" },
];

function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(\s+)/);
  return parts.map((part, i) => {
    if (part.startsWith("#") && part.length > 1) {
      return (
        <Link
          key={i}
          to={`/search?tag=${part.slice(1)}`}
          className="text-blue-500 hover:underline font-medium"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "только что";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const reactionRef = useRef<HTMLDivElement>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showShare, setShowShare] = useState(false);
  const [shareText, setShareText] = useState("");
  const [localViews, setLocalViews] = useState(post.views);
  const cardRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const isOwner = user?.id === post.userId;
  const isLiked = user ? post.likes.includes(user.id) : false;
  const hasReacted = user
    ? Object.values(post.reactions).some((arr) => arr.includes(user.id))
    : false;
  const myReaction = user
    ? Object.entries(post.reactions).find(([, arr]) =>
        arr.includes(user.id)
      )?.[0]
    : null;
  const totalReactions = Object.values(post.reactions).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  useEffect(() => {
    if (!user) return;
    setIsBooked(isBookmarked(user.id, post.id));
  }, [user, post.id]);

  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showMenu]);

  useEffect(() => {
    if (!showReactions) return;
    const h = (e: MouseEvent) => {
      if (
        reactionRef.current &&
        !reactionRef.current.contains(e.target as Node)
      )
        setShowReactions(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showReactions]);

  // Count views once per session when post enters viewport
  useEffect(() => {
    const viewed: string[] = JSON.parse(
      sessionStorage.getItem("damn-viewed") || "[]"
    );
    if (viewed.includes(post.id)) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const current: string[] = JSON.parse(
            sessionStorage.getItem("damn-viewed") || "[]"
          );
          if (!current.includes(post.id)) {
            current.push(post.id);
            sessionStorage.setItem("damn-viewed", JSON.stringify(current));
            incrementViews(post.id);
            setLocalViews((v) => v + 1);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [post.id]);

  // Load comments when comments section opens
  useEffect(() => {
    if (showComments) {
      setComments(getPostComments(post.id));
    }
  }, [showComments, post.id]);

  const handleReaction = (emoji: string) => {
    if (!user) return;
    toggleReaction(post.id, user.id, emoji);
    setShowReactions(false);
    onUpdate();
  };

  const handleBookmark = () => {
    if (!user) return;
    toggleBookmark(user.id, post.id);
    setIsBooked(!isBooked);
  };

  const handleDelete = () => {
    deletePost(post.id);
    onUpdate();
    setShowMenu(false);
  };

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== post.content) {
      updatePost(post.id, editContent.trim());
      onUpdate();
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleEditOpen = () => {
    setEditContent(post.content);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleAddComment = () => {
    if (!user || !newComment.trim()) return;
    createComment(
      post.id,
      user.id,
      user.username,
      newComment.trim(),
      replyTo?.id || null
    );
    if (post.userId !== user.id) {
      addNotification({
        userId: post.userId,
        type: "comment",
        fromUserId: user.id,
        fromUsername: user.username,
        targetId: post.id,
        targetType: "post",
      });
    }
    setNewComment("");
    setReplyTo(null);
    setComments(getPostComments(post.id));
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
    setComments(getPostComments(post.id));
  };

  const handleCommentLike = (commentId: string) => {
    if (!user) return;
    toggleCommentLike(commentId, user.id);
    setComments(getPostComments(post.id));
  };

  // Flat comment list: root comments first, then their replies after
  const orderedComments = (): Comment[] => {
    const result: Comment[] = [];
    const addWithReplies = (parentId: string | null) => {
      const children = comments.filter((c) => c.parentId === parentId);
      for (const c of children) {
        result.push(c);
        addWithReplies(c.id);
      }
    };
    addWithReplies(null);
    return result;
  };

  const getParentUsername = (comment: Comment): string | null => {
    if (!comment.parentId) return null;
    const parent = comments.find((c) => c.id === comment.parentId);
    return parent?.username || null;
  };

  const renderComment = (comment: Comment): React.ReactNode => {
    const parentUser = getParentUsername(comment);
    const isReply = !!parentUser;

    return (
      <div key={comment.id}>
        <div className={`flex items-start gap-2 ${isReply ? "ml-6" : ""}`}>
          <Link
            to={`/profile/${comment.username}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-500 text-white text-[10px] font-bold dark:bg-gray-500"
          >
            {comment.username.charAt(0).toUpperCase()}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="rounded-xl bg-gray-100 px-3 py-2 dark:bg-gray-700">
              {isReply && (
                <span className="mr-1 text-[10px] text-blue-500 font-medium">
                  ↩ {parentUser}
                </span>
              )}
              <Link
                to={`/profile/${comment.username}`}
                className="text-xs font-semibold text-gray-700 hover:underline dark:text-gray-200"
              >
                {comment.username}
              </Link>
              <p className="mt-0.5 text-sm text-gray-800 dark:text-gray-100 break-words">
                {renderContent(comment.content)}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-3 px-1">
              <span className="text-[10px] text-gray-400">
                {timeAgo(comment.createdAt)}
              </span>
              <button
                onClick={() => handleCommentLike(comment.id)}
                className={`text-[10px] font-medium transition-colors ${
                  comment.likes.includes(user!.id)
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-400"
                }`}
              >
                ♥{comment.likes.length > 0 && ` ${comment.likes.length}`}
              </button>
              <button
                onClick={() => {
                  setReplyTo(comment);
                  setTimeout(() => commentInputRef.current?.focus(), 50);
                }}
                className="text-[10px] font-medium text-gray-400 hover:text-blue-400"
              >
                Ответить
              </button>
              {comment.userId === user!.id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-[10px] font-medium text-gray-400 hover:text-red-400"
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleShare = () => {
    if (!user) return;
    createQuotePost(user.id, user.username, shareText.trim(), post);
    onUpdate();
    setShowShare(false);
    setShareText("");
  };

  const contentLines = post.content.split("\n");
  const isLong = contentLines.length > 5 || post.content.length > 300;
  const [expanded, setExpanded] = useState(false);
  const displayContent =
    isLong && !expanded ? post.content.slice(0, 300) + "..." : post.content;
  const showExpand = isLong && !expanded;

  return (
    <div ref={cardRef} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link
          to={`/profile/${post.username}`}
          className="flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-white text-sm font-bold dark:bg-gray-500">
            {post.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors dark:text-gray-100 dark:group-hover:text-gray-300">
              {post.username}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {timeAgo(post.createdAt)}
              {post.editedAt && " · edited"}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <button
                  onClick={isEditing ? handleEditSave : handleEditOpen}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {isEditing ? "💾 Сохранить" : "✏️ Редактировать"}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  🗑 Удалить
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit area */}
      {isEditing ? (
        <div className="mb-3 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-gray-500 focus:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <div className="flex gap-2">
            <button
              onClick={handleEditSave}
              className="rounded-lg bg-gray-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}

      {/* Quoted post */}
      {post.quotes.length > 0 && (
        <div className="mb-3 rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50">
          <Link
            to={`/profile/${post.quotes[0].username}`}
            className="text-xs font-semibold text-gray-500 hover:underline dark:text-gray-400"
          >
            {post.quotes[0].username}
          </Link>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {post.quotes[0].content}
          </p>
        </div>
      )}

      {/* Content */}
      {!isEditing && (
        <div>
          <p className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed dark:text-gray-200">
            {renderContent(displayContent)}
          </p>
          {showExpand && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-1 text-sm text-blue-500 hover:underline"
            >
              Читать далее...
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-100 pt-3 dark:border-gray-700">
        {/* Reactions */}
        <div className="relative" ref={reactionRef}>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              hasReacted
                ? "text-yellow-500"
                : isLiked
                ? "text-red-500"
                : "text-gray-500 hover:text-red-400 dark:text-gray-400"
            }`}
          >
            {hasReacted && myReaction ? (
              <span className="text-base">{myReaction}</span>
            ) : (
              <svg
                className={`h-5 w-5 transition-transform ${isLiked ? "scale-110" : ""}`}
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isLiked ? 0 : 1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            )}
            {post.likes.length > 0 && <span>{post.likes.length}</span>}
            {totalReactions > 0 && (
              <span className="text-yellow-500">+{totalReactions}</span>
            )}
          </button>
          {showReactions && (
            <div className="absolute bottom-full mb-2 left-0 z-20 flex gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {REACTIONS.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => handleReaction(r.emoji)}
                  title={r.label}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>

        {/* Repost */}
        {!isOwner && post.quotes.length === 0 && (
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-green-500 dark:text-gray-400"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
              />
            </svg>
            Репост
          </button>
        )}

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`ml-auto flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isBooked
              ? "text-blue-500"
              : "text-gray-500 hover:text-blue-400 dark:text-gray-400"
          }`}
        >
          <svg
            className="h-5 w-5"
            fill={isBooked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isBooked ? 0 : 1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>

        {/* Views */}
        <span className="text-xs text-gray-400 dark:text-gray-500">
          👁 {localViews}
        </span>
      </div>

      {/* Repost modal */}
      {showShare && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
          <p className="mb-1 text-xs font-medium text-gray-500">Репост записи</p>
          <p className="mb-3 truncate text-sm text-gray-600 dark:text-gray-300">
            {post.content.slice(0, 120)}...
          </p>
          <textarea
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            placeholder="Ваш комментарий"
            rows={2}
            className="mb-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="rounded-lg bg-gray-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Репостнуть
            </button>
            <button
              onClick={() => {
                setShowShare(false);
                setShareText("");
              }}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-500 text-white text-xs font-bold dark:bg-gray-500">
              {user!.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {replyTo && (
                <div className="mb-1.5 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                  <span className="text-gray-400">↩</span>
                  <span>Ответ для <b>{replyTo.username}</b></span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder={replyTo ? `Ответ ${replyTo.username}...` : "Комментарий..."}
                  className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none transition-all focus:border-gray-400 focus:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-800"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="rounded-full bg-gray-600 p-2 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors dark:bg-gray-500 dark:hover:bg-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {orderedComments().length > 0 ? (
            <div className="mt-4 space-y-3">
              {orderedComments().map((comment) => renderComment(comment))}
            </div>
          ) : (
            <p className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
              Пока нет комментариев
            </p>
          )}
        </div>
      )}
    </div>
  );
}