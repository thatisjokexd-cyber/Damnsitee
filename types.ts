export interface User {
  id: string;
  username: string;
  password: string;
  bio: string;
  avatar: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
  likes: string[];
  reactions: Record<string, string[]>; // emoji => userId[]
  views: number;
  quotes: QuotePost[];
}

export interface QuotePost {
  postId: string;
  userId: string;
  username: string;
  content: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  likes: string[];
  parentId: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: "like" | "comment" | "follow" | "mention";
  fromUserId: string;
  fromUsername: string;
  targetId: string;
  targetType: "post" | "comment";
  createdAt: string;
  read: boolean;
}

export interface Follow {
  followerId: string;
  followingId: string;
}

export interface Bookmark {
  userId: string;
  postId: string;
}

export interface AuthState {
  user: Omit<User, "password"> | null;
  isAuthenticated: boolean;
}

export type Theme = "light" | "dark" | "system";