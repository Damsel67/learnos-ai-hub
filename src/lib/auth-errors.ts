export function friendlyAuthError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (!m) return "Something went wrong. Please try again.";
  if (m.includes("invalid login credentials"))
    return "Invalid email or password. Please check your details and try again.";
  if (m.includes("email not confirmed") || m.includes("not confirmed"))
    return "Please verify your email address before signing in.";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already"))
    return "That email is already registered. Try signing in instead.";
  if (m.includes("user not found")) return "We couldn't find an account with that email address.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "That password is too weak. Use at least 8 characters with a mix of types.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("fetch") || m.includes("network"))
    return "Network error. Please check your connection and try again.";
  return message ?? "Something went wrong. Please try again.";
}
