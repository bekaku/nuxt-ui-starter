<script setup lang="ts">
import { manualCategories, pickManualText } from '~/libs/manuals'

definePageMeta({
  pageName: 'nav.manual'
})

const { locale } = useLang()
const search = ref('')

const lang = computed(() => locale.value)

const filteredCategories = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return manualCategories
  return manualCategories
    .map(cat => ({
      ...cat,
      items: cat.items.filter((item) => {
        const title = pickManualText(item.title, lang.value)
        const desc = pickManualText(item.desc, lang.value)
        return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
      })
    }))
    .filter(cat => cat.items.length > 0)
})

const totalResults = computed(() => {
  return filteredCategories.value.reduce((sum, cat) => sum + cat.items.length, 0)
})

const goManual = async (slug: string) => {
  await navigateTo(`/manual/${slug}`)
}

const clearSearch = () => {
  search.value = ''
}
</script>

<template>
  <BaseDashboardPanel id="manual" :title="$t('nav.manual')">
    <div class="w-full max-w-[1200px] mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <p class="text-sm text-muted flex-1">
          {{ $t('page.manualSubtitle') }}
        </p>
        <UInput
          v-model="search"
          :placeholder="$t('page.manualSearchPlaceholder')"
          icon="lucide:search"
          class="w-full md:w-72"
          autocomplete="off"
        >
          <template v-if="search" #trailing>
            <UButton
              color="neutral"
              variant="link"
              icon="lucide:x"
              size="xs"
              @click="clearSearch"
            />
          </template>
        </UInput>
      </div>

      <div v-if="filteredCategories.length === 0" class="py-16 text-center">
        <Icon name="lucide:book-open" class="size-10 text-muted mx-auto mb-3" />
        <p class="text-muted text-sm mb-4">
          {{ $t('page.manualEmpty') }}
        </p>
        <UButton color="neutral" variant="soft" @click="clearSearch">
          {{ $t('base.clear') }}
        </UButton>
      </div>

      <div v-else class="flex flex-col gap-8">
        <section v-for="cat in filteredCategories" :key="cat.key">
          <h2 class="font-bold text-base mb-3">
            {{ pickManualText(cat.title, lang) }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard
              v-for="item in cat.items"
              :key="item.slug"
              class="cursor-pointer hover:border-primary/60 hover:shadow-md transition"
              :ui="{ body: 'p-5' }"
              @click="goManual(item.slug)"
            >
              <div class="flex gap-3">
                <Icon :name="item.icon" class="size-6 text-primary shrink-0 mt-0.5" />
                <div class="min-w-0">
                  <h3 class="font-semibold text-[15px] leading-snug mb-1">
                    {{ pickManualText(item.title, lang) }}
                  </h3>
                  <p class="text-sm text-muted leading-relaxed line-clamp-2">
                    {{ pickManualText(item.desc, lang) }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>
        </section>

        <p v-if="search.trim()" class="text-xs text-muted">
          {{ $t('page.manualResultCount', [totalResults]) }}
        </p>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
