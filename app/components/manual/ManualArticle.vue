<script setup lang="ts">
import { findManualTopic, loadManualContent, manualText } from '~/manual'

// One manual topic, rendered from app/manual/<slug>.<locale>.md.
const props = defineProps<{ slug: string, basePath: string }>()

const { locale } = useLang()
const topic = findManualTopic(props.slug)
if (!topic) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

const topicIcon = topic.icon
const title = computed(() => manualText(topic.title, locale.value))
useSeoMeta({ title })

const { data } = await useAsyncData(
  () => `manual:${props.slug}:${locale.value}`,
  () => loadManualContent(props.slug, locale.value),
  { watch: [locale] }
)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Manual content not found', fatal: true })
}

const content = computed(() => data.value?.content ?? '')
const isFallbackLocale = computed(() => !!data.value && data.value.locale !== locale.value)
</script>

<template>
  <div class="mx-auto flex w-full max-w-[860px] flex-col gap-4 px-4 py-6">
    <NuxtLink :to="basePath" class="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-primary">
      <UIcon name="lucide:arrow-left" class="size-4" />
      {{ $t('page.manualBack') }}
    </NuxtLink>

    <h1 class="flex items-center gap-2 text-2xl font-bold text-highlighted">
      <UIcon :name="topicIcon" class="size-6 text-primary" />
      {{ title }}
    </h1>

    <UAlert
      v-if="isFallbackLocale"
      color="neutral"
      variant="soft"
      icon="lucide:languages"
      :description="$t('page.manualFallbackNotice')"
    />

    <div v-if="content" class="manual-content">
      <!-- BaseMarkdownPreview reads its content once: key it by the loaded text (not the locale), so it
           re-mounts when the new locale's content has arrived rather than before. -->
      <BaseMarkdownPreview
        :key="content"
        :editor-id="`manual-${slug}`"
        :content="content"
      />
    </div>
  </div>
</template>

<style>
/* Tailwind preflight removes list markers; the manual relies on numbered steps and bullets. */
.manual-content .md-editor-preview ol {
  list-style: decimal;
}
.manual-content .md-editor-preview ul {
  list-style: disc;
}
/* Same heading scale as the rest of the console (preflight resets headings to body size). */
.manual-content .md-editor-preview h2 {
  font-size: 1.35rem;
  font-weight: 700;
}
.manual-content .md-editor-preview h3 {
  font-size: 1.1rem;
  font-weight: 700;
}
</style>
