<script setup lang="ts">
useHead({
  htmlAttrs: { lang: "en" },
});
useSeoMeta({
  titleTemplate: (title) => (title ? `${title} - tt` : "tt"),
});
</script>

<template>
  <UApp>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
