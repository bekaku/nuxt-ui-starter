<script setup lang="ts">
import { MANUAL_SECTIONS, manualText } from '~/manual'

// Manual home: sections of topic cards + search over title/description in the current locale.
defineProps<{ basePath: string }>()

const { locale } = useLang()
const keyword = ref('')

const sections = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return MANUAL_SECTIONS
    .map(section => ({
      key: section.key,
      title: manualText(section.title, locale.value),
      topics: section.topics
        .map(topic => ({
          slug: topic.slug,
          icon: topic.icon,
          title: manualText(topic.title, locale.value),
          description: manualText(topic.description, locale.value)
        }))
        .filter(topic => !query || `${topic.title} ${topic.description}`.toLowerCase().includes(query))
    }))
    .filter(section => section.topics.length > 0)
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-muted">
        {{ $t('page.manualSubtitle') }}
      </p>
      <UInput
        v-model="keyword"
        icon="lucide:search"
        :placeholder="$t('page.manualSearchPlaceholder')"
        class="w-full sm:w-80"
        autocomplete="off"
      />
    </div>

    <section v-for="section in sections" :key="section.key" class="flex flex-col gap-3">
      <h2 class="text-base font-semibold text-highlighted">
        {{ section.title }}
      </h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="topic in section.topics"
          :key="topic.slug"
          :to="`${basePath}/${topic.slug}`"
          class="flex gap-3 rounded-lg border border-default bg-default p-4 transition-colors hover:border-primary/40 hover:bg-elevated/50"
        >
          <UIcon :name="topic.icon" class="mt-0.5 size-5 shrink-0 text-primary" />
          <span class="flex min-w-0 flex-col gap-1">
            <span class="font-medium text-highlighted">{{ topic.title }}</span>
            <span class="text-sm text-muted">{{ topic.description }}</span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <p v-if="sections.length === 0" class="py-10 text-center text-sm text-muted">
      {{ $t('page.manualEmpty') }}
    </p>
  </div>
</template>
