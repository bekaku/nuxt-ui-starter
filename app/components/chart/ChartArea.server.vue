<script setup lang="ts">
import type {
  AreaChartProps
} from "~/types/chart";

defineProps<AreaChartProps>();
</script>
<template>
  <USkeleton v-bind="$attrs" class="h-full w-full" />
</template>
