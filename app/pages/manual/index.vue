<script setup lang="ts">
definePageMeta({
  pageName: 'nav.manual'
})

const { t } = useLang()
useSeoMeta({ title: () => t('nav.manual') })
</script>

<template>
  <BaseDashboardPanel id="manual" :title="$t('nav.manual')">
    <ManualIndex base-path="/manual" />
  </BaseDashboardPanel>
</template>
