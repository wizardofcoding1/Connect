/**
 * Username/password auth helpers.
 *
 * Supabase authenticates by email, so each username maps to a synthetic
 * address. That also gives username uniqueness for free: Supabase rejects a
 * duplicate email, so two people can never claim the same name.
 */

export const USERNAME_DOMAIN = '@connectapp.com';
export const MIN_PASSWORD_LENGTH = 4;
export const MIN_USERNAME_LENGTH = 3;

// Keep to characters that are safe in the local part of an email address
const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

export const normalizeUsername = (username) => (username || '').trim().toLowerCase();

export const usernameToEmail = (username) => `${normalizeUsername(username)}${USERNAME_DOMAIN}`;

export const emailToUsername = (email) => (email || '').replace(USERNAME_DOMAIN, '');

/**
 * @returns {string|null} an error message, or null when valid
 */
export function validateUsername(username) {
  const value = normalizeUsername(username);

  if (!value) return 'Username is required';
  if (value.length < MIN_USERNAME_LENGTH) {
    return `Username must be at least ${MIN_USERNAME_LENGTH} characters`;
  }
  if (!USERNAME_PATTERN.test(value)) {
    return 'Username can only use letters, numbers, dots, hyphens and underscores';
  }
  return null;
}

/**
 * @returns {string|null} an error message, or null when valid
 */
export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

/**
 * Turn Supabase's auth errors into something a person can act on.
 */
export function readableAuthError(error) {
  const message = error?.message || '';

  if (/already registered/i.test(message)) {
    return 'That username is already taken. Please choose another.';
  }
  if (/invalid login credentials/i.test(message)) {
    return 'Incorrect username or password.';
  }
  if (/password should be at least/i.test(message)) {
    // Supabase enforces its own project-level minimum, which can be stricter
    // than ours; pass its wording through so the real limit is visible.
    return message;
  }
  if (/email not confirmed/i.test(message)) {
    return 'This account is not confirmed yet. Contact the administrator.';
  }
  return message || 'Something went wrong. Please try again.';
}
