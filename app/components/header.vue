<script setup lang="ts">
const { currentWeek, now, resetCurrentWeek } = useDate();
const { signOut } = useAuth();
</script>

<template>
  <div class="mt-1 grid grid-cols-3">
    <div>
      <UButton
        :variant="currentWeek.isoWeek() === now.isoWeek() ? 'soft' : 'outline'"
        label="This week"
        class="ml-13 py-1"
        size="sm"
        :color="currentWeek.isoWeek() === now.isoWeek() ? 'primary' : 'neutral'"
        @click="resetCurrentWeek"
      />
    </div>
    <div class="flex justify-center">
      <WeekIndicator />
    </div>
    <div class="mr-2 flex items-center justify-end gap-2">
      <UButton icon="lucide:cog" color="secondary" variant="soft" size="sm" />
      <UPopover :content="{ side: 'bottom' }">
        <UButton icon="lucide:log-out" variant="soft" color="error" size="sm" />
        <template #content>
          <UButton
            icon="lucide:log-out"
            variant="soft"
            color="error"
            @click="signOut"
            >Log out</UButton
          >
        </template>
      </UPopover>
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
  </div>
</template>
