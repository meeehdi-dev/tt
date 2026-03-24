<script setup lang="ts">
const color = defineModel<string>({ required: true });
const isOpen = ref(false);

// Curated palette of colors
const swatches = [
  "#f59e0b", // amber-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#f97316", // orange-500
];

function selectSwatch(c: string) {
  color.value = c;
  isOpen.value = false;
}
</script>

<template>
  <UPopover v-model:open="isOpen">
    <button class="size-6 cursor-pointer rounded-md border border-neutral-700" :style="{ backgroundColor: color }" />
    <template #content>
      <div class="flex flex-col gap-2 p-2">
        <div class="grid grid-cols-4 gap-1">
          <button
            v-for="swatch in swatches"
            :key="swatch"
            class="size-6 cursor-pointer rounded-sm"
            :style="{ backgroundColor: swatch }"
            @click="selectSwatch(swatch)" />
        </div>
        <USeparator />
        <UColorPicker v-model="color" />
      </div>
    </template>
  </UPopover>
</template>
