<script setup lang="ts">
definePageMeta({
  layout: "default",
  // requiresPermission: ['role_manage', 'rome_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "Feed page",
});
</script>

<template>
  <BaseDashboardPanel id="example-feed" title="Feed page">
  </BaseDashboardPanel>
</template>
