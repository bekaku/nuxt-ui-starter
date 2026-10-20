<script setup lang="ts">
definePageMeta({
  pageName: 'nav.manual'
})

const route = useRoute()
</script>

<template>
  <BaseDashboardPanel id="manual-detail" :title="$t('nav.manual')">
    <ManualArticle :slug="String(route.params.slug)" base-path="/manual" />
  </BaseDashboardPanel>
</template>
