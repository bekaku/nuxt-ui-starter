<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number | string;
    height?: number | string;
    alt?: string;
    imgClass?: string;
  }>(),
  { alt: "" },
);
</script>

<template>
  <!-- Both logos are rendered and switched by CSS: the server can't know the color mode,
       so choosing the file via isDark mismatches on hydration and sticks to the wrong logo -->
  <span class="inline-flex shrink-0">
    <NuxtImg
      src="/logo/logo-black.png"
      :width
      :height
      :alt
      :class="['shrink-0', imgClass, 'dark:hidden']"
    />
    <NuxtImg
      src="/logo/logo-white.png"
      :width
      :height
      :alt
      :class="['shrink-0', imgClass, 'hidden dark:block']"
    />
  </span>
</template>
