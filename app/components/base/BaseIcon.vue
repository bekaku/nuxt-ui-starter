<script setup lang="ts">
import type { IconProps } from "@nuxt/ui";

const { size = "24" } = defineProps<IconProps>();
</script>
<template>
  <UIcon v-bind="$attrs" :name="name" :size="size" :mode="mode" />
</template>
