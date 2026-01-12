export interface Session {
  cookie: Record<string, string>;
  userId: string;
  userAgent: string;
}
