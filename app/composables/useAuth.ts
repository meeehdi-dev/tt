export function useAuth() {
  const token = useCookie<string | null>("fake_jwt");

  const signIn = async (_email: string, _password: string) => {
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
