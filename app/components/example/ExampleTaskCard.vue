<script setup lang="ts">
import type { ExampleTask } from '~/types/models'

defineProps<{
  item: ExampleTask
  icon: string
  accent: string
  iconClass: string
}>()
</script>

<template>
  <div
    class="group relative cursor-grab overflow-hidden rounded-lg bg-default p-3 shadow-xs ring ring-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
  >
    <span class="absolute inset-y-0 left-0 w-1" :class="accent" />
    <div class="flex flex-col gap-2 pl-1.5">
      <div class="flex items-start justify-between gap-2">
        <div class="text-sm font-semibold text-highlighted">
          {{ item.task }}
        </div>
        <Icon
          name="lucide:grip-vertical"
          class="size-4 shrink-0 text-dimmed opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <p class="line-clamp-2 text-sm text-muted">
        {{ item.description }}
      </p>
      <div class="flex flex-wrap gap-1.5">
        <UBadge
          v-for="chip in item.chips"
          :key="chip"
          :label="chip"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </div>
      <div class="flex items-center justify-between border-t border-default pt-2">
        <div class="flex items-center gap-1.5 text-xs text-muted">
          <Icon :name="icon" class="size-4" :class="iconClass" />
          <span>#{{ item.id }}</span>
        </div>
        <UAvatar :src="item.avatar" size="xs" loading="lazy" />
      </div>
    </div>
  </div>
</template>
