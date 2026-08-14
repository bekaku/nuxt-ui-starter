<script setup lang="ts">
useSeoMeta({
  title: "Recent Chats",
});
definePageMeta({
  layout: "ai",
});
</script>

<template>
  <BaseDashboardPanel id="ai-chats-recent" title="Recent Chats" :collapseable="false">
  </BaseDashboardPanel>
</template>
