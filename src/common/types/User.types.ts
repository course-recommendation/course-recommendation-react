export type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
};

export function getUserFullName(user: User) {
  return user.fullName;
}
