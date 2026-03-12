import { defineNuxtRouteMiddleware, navigateTo } from "#imports";

export default defineNuxtRouteMiddleware((to) => {
  const { token } = useAuth();

  // If user is trying to access a protected route without a token
  if (!token.value && to.path !== "/sign-in") {
    return navigateTo("/sign-in");
  }

  // If user is trying to access the sign-in page while already authenticated
  if (token.value && to.path === "/sign-in") {
    return navigateTo("/");
  }
});
