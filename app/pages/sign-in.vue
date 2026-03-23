<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import { authClient } from "~/lib/auth";

useSeoMeta({
  title: "Sign In",
});

const providers: ButtonProps[] = [
  {
    label: "GitHub",
    icon: "lucide:github",
    loadingAuto: true,
    onClick: async () => {
      await authClient.signIn.social({ provider: "github", callbackURL: "/" });
    },
    color: "primary",
    variant: "soft",
  },
];
</script>

<template>
  <div class="flex h-screen items-center justify-center p-4">
    <div class="absolute h-full w-full overflow-hidden rounded-lg">
      <FlickeringGrid
        class="relative inset-0 z-0 mask-[radial-gradient(450px_circle_at_center,white,transparent)]"
        :square-size="2"
        :grid-gap="8"
        color="#ffba00"
        :max-opacity="1.0"
        :flicker-chance="0.01" />
    </div>
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Welcome back"
        description="Sign in to your account to continue"
        icon="lucide:lock"
        :ui="{ leadingIcon: 'text-primary-400' }"
        :providers="providers" />
    </UPageCard>
  </div>
</template>
