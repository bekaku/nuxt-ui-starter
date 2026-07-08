<script setup lang="ts">
definePageMeta({
  layout: "default",
  // requiresPermission: ['role_manage', 'rome_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "Charts page",
});
</script>

<template>
  <BaseDashboardPanel id="example-charts" title="Charts page">
  </BaseDashboardPanel>
</template>
