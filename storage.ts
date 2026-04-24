import type {
  User,
  Post,
  Comment,
  Notification,
  Follow,
  Bookmark,
  Theme,
} from "../types";

const USERS_KEY = "damn-users";
const POSTS_KEY = "damn-posts";
const COMMENTS_KEY = "damn-comments";
const NOTIFICATIONS_KEY = "damn-notifications";
const FOLLOWS_KEY = "damn-follows";
const BOOKMARKS_KEY = "damn-bookmarks";
const CURRENT_USER_KEY = "damn-current-user";
const THEME_KEY = "damn-theme";

// ─── Users ───────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  const d = localStorage.getItem(USERS_KEY);
  return d ? JSON.parse(d) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByUsername(username: string): User | undefined {
  return getUsers().find((u) => u.username === username);
}

export function findUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function createUser(
  username: string,
  password: string
): Omit<User, "password"> {
  const users = getUsers();
  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    password,
    bio: "",
    avatar: "",
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  const { password: _, ...rest } = newUser;
  return rest;
}

export function updateUserBio(userId: string, bio: string): boolean {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  users[idx].bio = bio.slice(0, 150);
  saveUsers(users);
  return true;
}

export function getFollowers(userId: string): string[] {
  const follows = getFollows();
  return follows.filter((f) => f.followingId === userId).map((f) => f.followerId);
}

export function getFollowing(userId: string): string[] {
  const follows = getFollows();
  return follows.filter((f) => f.followerId === userId).map((f) => f.followingId);
}

export function getAllUsers(): User[] {
  return getUsers();
}

// ─── Follows ────────────────────────────────────────────────────────────────

export function getFollows(): Follow[] {
  const d = localStorage.getItem(FOLLOWS_KEY);
  return d ? JSON.parse(d) : [];
}

export function saveFollows(follows: Follow[]): void {
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
}

export function isFollowing(followerId: string, followingId: string): boolean {
  return getFollows().some(
    (f) => f.followerId === followerId && f.followingId === followingId
  );
}

export function toggleFollow(followerId: string, followingId: string): boolean {
  const follows = getFollows();
  const idx = follows.findIndex(
    (f) => f.followerId === followerId && f.followingId === followingId
  );
  if (idx === -1) {
    follows.push({ followerId, followingId });
    saveFollows(follows);
    return true;
  } else {
    follows.splice(idx, 1);
    saveFollows(follows);
    return false;
  }
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export function getPosts(): Post[] {
  const d = localStorage.getItem(POSTS_KEY);
  return d ? JSON.parse(d) : [];
}

export function savePosts(posts: Post[]): void {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function createPost(
  userId: string,
  username: string,
  content: string
): Post {
  const posts = getPosts();
  const newPost: Post = {
    id: crypto.randomUUID(),
    userId,
    username,
    content,
    createdAt: new Date().toISOString(),
    editedAt: null,
    likes: [],
    reactions: {},
    views: 0,
    quotes: [],
  };
  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}

export function createQuotePost(
  userId: string,
  username: string,
  content: string,
  quoted: Post
): Post {
  const posts = getPosts();
  const newPost: Post = {
    id: crypto.randomUUID(),
    userId,
    username,
    content,
    createdAt: new Date().toISOString(),
    editedAt: null,
    likes: [],
    reactions: {},
    views: 0,
    quotes: [
      {
        postId: quoted.id,
        userId: quoted.userId,
        username: quoted.username,
        content: quoted.content,
      },
    ],
  };
  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}

export function updatePost(postId: string, content: string): Post | null {
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  post.content = content;
  post.editedAt = new Date().toISOString();
  savePosts(posts);
  return post;
}

export function deletePost(postId: string): void {
  savePosts(getPosts().filter((p) => p.id !== postId));
  // cascade delete comments
  saveComments(getComments().filter((c) => c.postId !== postId));
}

export function getPostById(postId: string): Post | undefined {
  return getPosts().find((p) => p.id === postId);
}

export function getUserPosts(userId: string): Post[] {
  return getPosts().filter((p) => p.userId === userId);
}

export function getFeedPosts(userId: string, followingIds: string[]): Post[] {
  const all = getPosts();
  if (followingIds.length === 0) return all;
  return all.filter(
    (p) => p.userId === userId || followingIds.includes(p.userId)
  );
}

export function incrementViews(postId: string): void {
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.views++;
    savePosts(posts);
  }
}

// ─── Likes ───────────────────────────────────────────────────────────────────

export function toggleLike(
  postId: string,
  userId: string
): { type: "added" | "removed"; count: number } | null {
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  const idx = post.likes.indexOf(userId);
  if (idx === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(idx, 1);
  }
  savePosts(posts);
  return {
    type: idx === -1 ? "added" : "removed",
    count: post.likes.length,
  };
}

export function toggleReaction(
  postId: string,
  userId: string,
  emoji: string
): void {
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return;
  const reactions = post.reactions;
  if (!reactions[emoji]) reactions[emoji] = [];
  const idx = reactions[emoji].indexOf(userId);
  if (idx === -1) {
    reactions[emoji].push(userId);
    // remove from likes if they had one
    const likeIdx = post.likes.indexOf(userId);
    if (likeIdx !== -1) post.likes.splice(likeIdx, 1);
  } else {
    reactions[emoji].splice(idx, 1);
  }
  // cleanup empty
  if (reactions[emoji].length === 0) delete reactions[emoji];
  savePosts(posts);
}

export function getReactions(postId: string): Record<string, string[]> {
  const post = getPosts().find((p) => p.id === postId);
  return post?.reactions ?? {};
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export function getBookmarks(): Bookmark[] {
  const d = localStorage.getItem(BOOKMARKS_KEY);
  return d ? JSON.parse(d) : [];
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(userId: string, postId: string): boolean {
  return getBookmarks().some((b) => b.userId === userId && b.postId === postId);
}

export function toggleBookmark(userId: string, postId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex(
    (b) => b.userId === userId && b.postId === postId
  );
  if (idx === -1) {
    bookmarks.push({ userId, postId });
    saveBookmarks(bookmarks);
    return true;
  } else {
    bookmarks.splice(idx, 1);
    saveBookmarks(bookmarks);
    return false;
  }
}

export function getUserBookmarks(userId: string): Post[] {
  const bm = getBookmarks().filter((b) => b.userId === userId);
  const posts = getPosts();
  return bm.map((b) => posts.find((p) => p.id === b.postId)).filter(Boolean) as Post[];
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function getComments(): Comment[] {
  const d = localStorage.getItem(COMMENTS_KEY);
  return d ? JSON.parse(d) : [];
}

export function saveComments(comments: Comment[]): void {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getPostComments(postId: string): Comment[] {
  return getComments().filter((c) => c.postId === postId);
}

export function createComment(
  postId: string,
  userId: string,
  username: string,
  content: string,
  parentId: string | null
): Comment {
  const comments = getComments();
  const newComment: Comment = {
    id: crypto.randomUUID(),
    postId,
    userId,
    username,
    content,
    createdAt: new Date().toISOString(),
    likes: [],
    parentId,
  };
  comments.push(newComment);
  saveComments(comments);
  return newComment;
}

export function deleteComment(commentId: string): void {
  saveComments(getComments().filter((c) => c.id !== commentId));
}

export function toggleCommentLike(
  commentId: string,
  userId: string
): void {
  const comments = getComments();
  const c = comments.find((c) => c.id === commentId);
  if (!c) return;
  const idx = c.likes.indexOf(userId);
  if (idx === -1) c.likes.push(userId);
  else c.likes.splice(idx, 1);
  saveComments(comments);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function getNotifications(userId: string): Notification[] {
  const d = localStorage.getItem(NOTIFICATIONS_KEY);
  return d
    ? JSON.parse(d)
        .filter((n: Notification) => n.userId === userId)
        .sort(
          (a: Notification, b: Notification) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    : [];
}

export function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function addNotification(notif: Omit<Notification, "id" | "read" | "createdAt">): void {
  const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]") as Notification[];
  all.push({
    ...notif,
    id: crypto.randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
  } as Notification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

export function markNotificationsRead(userId: string): void {
  const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]") as Notification[];
  all.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

export function getUnreadCount(userId: string): number {
  const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]") as Notification[];
  return all.filter((n) => n.userId === userId && !n.read).length;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getCurrentUser(): Omit<User, "password"> | null {
  const d = localStorage.getItem(CURRENT_USER_KEY);
  return d ? JSON.parse(d) : null;
}

export function setCurrentUser(user: Omit<User, "password">): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function updateCurrentUser(
  user: Omit<User, "password">,
  updates: Partial<Pick<User, "bio" | "avatar">>
): Omit<User, "password"> {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
  }
  const updated = { ...user, ...updates };
  setCurrentUser(updated);
  return updated;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export function getTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme) || "system";
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function searchUsers(query: string): User[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getUsers().filter((u) => u.username.toLowerCase().includes(q));
}

export function searchPosts(query: string): Post[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getPosts().filter((p) => {
    const hashtags = p.content.match(/#\w+/g) || [];
    return (
      p.content.toLowerCase().includes(q) ||
      hashtags.some((h: string) => h.toLowerCase().includes(q))
    );
  });
}

export function searchByHashtag(tag: string): Post[] {
  const t = tag.toLowerCase().replace("#", "");
  return getPosts().filter((p) =>
    (p.content.match(/#\w+/g) || []).some((h: string) =>
      h.toLowerCase().includes(t)
    )
  );
}