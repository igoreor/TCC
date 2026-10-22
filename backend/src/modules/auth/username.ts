/** Mesmo formato exigido pela restrição `users_username_format` do banco. */
export const USERNAME_PATTERN = /^[a-z0-9._-]{3,64}$/;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}
