<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
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
