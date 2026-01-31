export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
};

export function getUserFullName(user: User) {
  return `${user.lastName} ${user.firstName}`;
}
