import { authClient } from "~/lib/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch);

  if (!session.value && to.path !== "/sign-in") {
    return navigateTo("/sign-in");
  }
});
