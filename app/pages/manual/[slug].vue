<script setup lang="ts">
import { findManual, findManualCategory, getPrevNextManual, pickManualText } from '~/libs/manuals'

definePageMeta({
  pageName: 'nav.manual'
})

const route = useRoute()
const { locale } = useLang()
const slug = computed(() => String(route.params.slug || ''))

const manual = computed(() => findManual(slug.value))
const category = computed(() => findManualCategory(slug.value))
const prevNext = computed(() => getPrevNextManual(slug.value))
const lang = computed(() => locale.value)

if (!manual.value) {
  throw showError({ statusCode: 404, statusMessage: 'Manual not found' })
}

const { data, pending, error } = await useFetch('/api/manuals/content', {
  key: `manual-content-${slug.value}-${locale.value}`,
  query: { slug: slug.value, locale },
  default: () => null
})

const content = computed(() => (data.value as { content?: string } | null)?.content || '')
const updatedAt = computed(() => (data.value as { updatedAt?: string | null } | null)?.updatedAt || null)
const servedLocale = computed(() => (data.value as { servedLocale?: string } | null)?.servedLocale || null)
const isFallbackLocale = computed(() => {
  return !!servedLocale.value && !!content.value && servedLocale.value !== locale.value
})

const title = computed(() => {
  if (!manual.value) return ''
  return pickManualText(manual.value.title, lang.value)
})
const desc = computed(() => {
  if (!manual.value) return ''
  return pickManualText(manual.value.desc, lang.value)
})

useSeoMeta({
  title: () => title.value
})

const goBack = async () => {
  await navigateTo('/manual')
}

const goManual = async (target?: string) => {
  if (!target) return
  await navigateTo(`/manual/${target}`)
}
</script>

<template>
  <BaseDashboardPanel id="manual-detail" :title="title">
    <div class="w-full max-w-[860px] mx-auto px-4 py-6">
      <UBreadcrumb
        :items="[
          { label: $t('nav.manual'), to: '/manual' },
          { label: title }
        ]"
        class="mb-4"
      />

      <p v-if="category" class="text-xs text-muted mb-1">
        {{ pickManualText(category.title, lang) }}
      </p>
      <h1 class="text-2xl font-bold mb-2">
        {{ title }}
      </h1>
      <p class="text-sm text-muted mb-2">
        {{ desc }}
      </p>
      <p v-if="updatedAt" class="text-xs text-muted mb-4">
        {{ $t('page.manualUpdatedAt', [updatedAt]) }}
      </p>

      <USeparator class="my-4" />

      <UAlert
        v-if="!pending && !error && isFallbackLocale"
        color="neutral"
        variant="soft"
        icon="lucide:languages"
        :description="$t('page.manualFallbackNotice')"
        class="mb-4"
      />

      <div v-if="pending" class="flex flex-col gap-3">
        <USkeleton class="h-6 w-2/3" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
        <USkeleton class="h-40 w-full" />
      </div>

      <UAlert
        v-else-if="error || !content"
        color="error"
        variant="soft"
        :title="$t('page.manualNotFound')"
        :description="String((error as any)?.statusMessage || '')"
      >
        <template #actions>
          <UButton color="neutral" variant="soft" @click="goBack">
            {{ $t('page.manualBack') }}
          </UButton>
        </template>
      </UAlert>

      <BaseMarkdownPreview
        v-else
        :key="content"
        :content="content"
        :editor-id="`manual-${slug}`"
      />

      <USeparator class="my-6" />

      <div class="flex flex-col sm:flex-row gap-2 justify-between">
        <UButton
          color="neutral"
          variant="soft"
          icon="lucide:arrow-left"
          :disabled="!prevNext.prev"
          @click="goManual(prevNext.prev?.slug)"
        >
          {{ prevNext.prev ? pickManualText(prevNext.prev.title, lang) : $t('page.manualPrev') }}
        </UButton>
        <UButton
          color="neutral"
          variant="soft"
          trailing-icon="lucide:arrow-right"
          :disabled="!prevNext.next"
          @click="goManual(prevNext.next?.slug)"
        >
          {{ prevNext.next ? pickManualText(prevNext.next.title, lang) : $t('page.manualNext') }}
        </UButton>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
