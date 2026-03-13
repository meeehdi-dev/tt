<script setup lang="ts">
import { authClient } from "~/lib/auth";

useSeoMeta({
  title: "Sign In",
});

const providers = [
  {
    label: "GitHub",
    icon: "lucide:github",
    onClick: () => {
      void authClient.signIn.social({ provider: "github", callbackURL: "/" });
    },
  },
];
</script>

<template>
  <div class="flex h-screen items-center justify-center p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Welcome back"
        description="Sign in to your account to continue"
        icon="i-lucide-lock"
        :providers="providers"
      />
    </UPageCard>
  </div>
</template>
