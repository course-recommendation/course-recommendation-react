export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  didSurvey: boolean;
};

export function getUserFullName(user: User) {
  return `${user.lastName} ${user.firstName}`;
}
