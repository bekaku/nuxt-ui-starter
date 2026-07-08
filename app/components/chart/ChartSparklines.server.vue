<script setup lang="ts">
import type { SparkLineChartProps } from "~/types/chart";
defineProps<SparkLineChartProps>();
</script>
<template>
  <USkeleton v-bind="$attrs" class="h-full w-full" />
</template>
