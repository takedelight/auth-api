import { UserRole } from 'src/user/entity/user.entity';

export interface Session {
  cookie: Record<string, string>;
  userId: string;
  role: UserRole;
  userAgent: string;
}
