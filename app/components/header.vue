<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { authClient } from "~/lib/auth";

const session = authClient.useSession();

const { currentWeek, now, resetCurrentWeek } = useDate();

const items = ref<DropdownMenuItem[]>([
  {
    icon: "lucide:cog",
    label: "Settings",
    color: "secondary",
    onSelect: () => {
      open(ModalKey.Settings);
    },
  },
  {
    icon: "lucide:log-out",
    label: "Sign out",
    color: "error",
    onSelect: async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: async () => {
            await navigateTo("/sign-in");
          },
        },
      });
    },
  },
]);

defineShortcuts({
  g: {
    handler: () => {
      window.open("https://github.com/meeehdi-dev/tt", "_blank");
    },
  },
  arrowup: {
    handler: resetCurrentWeek,
  },
  arrowdown: {
    handler: resetCurrentWeek,
  },
  j: {
    handler: resetCurrentWeek,
  },
  k: {
    handler: resetCurrentWeek,
  },
});
</script>

<template>
  <div class="mt-1 grid grid-cols-3">
    <div>
      <UButton
        :variant="currentWeek.isoWeek() === now.isoWeek() ? 'soft' : 'outline'"
        label="This week"
        class="ml-10 py-1"
        size="sm"
        :color="currentWeek.isoWeek() === now.isoWeek() ? 'primary' : 'neutral'"
        @click="resetCurrentWeek"
      />
    </div>
    <div class="flex justify-center">
      <WeekIndicator />
    </div>
    <div class="mr-2 flex items-center justify-end gap-2">
      <UDropdownMenu :items="items">
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          :avatar="
            session.isPending ? undefined
            : session.data!.user.image ? { src: session.data!.user.image }
            : undefined
          "
          :icon="
            session.isPending ? 'lucide:loader-circle'
            : session.data!.user.image ? undefined
            : 'lucide:user'
          "
          :label="session.isPending ? undefined : session.data?.user.name"
          :loading="session.isPending"
        />
      </UDropdownMenu>

      <UButton
        icon="lucide:github"
        color="neutral"
        variant="ghost"
        size="sm"
        href="https://github.com/meeehdi-dev/tt"
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>

    <SettingsModal />
  </div>
</template>
