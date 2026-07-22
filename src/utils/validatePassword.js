// Minimal but real password strength check, shared between registration
// and password-change so the two paths can't drift out of sync.
export function isStrongPassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be at least 8 characters and include both letters and numbers.";
