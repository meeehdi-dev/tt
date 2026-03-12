import { useCookie, navigateTo } from "#imports";

export function useAuth() {
  const token = useCookie<string | null>("fake_jwt");

  const signIn = async () => {
    // In the future, this will be replaced by better-auth
    token.value = "dummy-jwt-token-xyz-123";
    await navigateTo("/");
  };

  const signOut = async () => {
    token.value = null;
    await navigateTo("/sign-in");
  };

  return {
    signIn,
    signOut,
    token,
  };
}
