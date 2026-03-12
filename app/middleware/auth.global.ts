export default defineNuxtRouteMiddleware((to) => {
  const { token } = useAuth();

  if (!token.value && to.path !== "/sign-in") {
    return navigateTo("/sign-in");
  }

  if (token.value && to.path === "/sign-in") {
    return navigateTo("/");
  }
});
