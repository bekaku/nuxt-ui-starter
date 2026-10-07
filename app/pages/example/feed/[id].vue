<script setup lang="ts">
import type { FeedItemDetail } from "~/types";

// layout comes from the parent route (feed.vue); declaring it here nests the layout twice
definePageMeta({
  validate: (route) => /^\d+$/.test(String(route.params.id)),
});

const FEED_PATH = "/example/feed";
const route = useRoute();
const router = useRouter();
const { t } = useLang();
const open = ref(true);
const id = computed(() => String(route.params.id));

// Third-party public API: plain $fetch so no app headers/cookies are sent to it
const { data, status, error, refresh } = useLazyAsyncData(
  () => `feed-item-${id.value}`,
  () =>
    $fetch<FeedItemDetail>(`/item/${id.value}`, {
      baseURL: "https://api.hackerwebapp.com",
    }),
  { server: false, watch: [id] },
);
const loading = computed(() => status.value === "pending" || !data.value && !error.value);
const commentCount = computed(() => data.value?.comments_count ?? 0);

useSeoMeta({
  title: () => data.value?.title || "Feed post",
});

// Closing returns to the URL the dialog was opened from (like Facebook)
const closeDialog = () => {
  const previous = window.history.state?.back;
  if (typeof previous === "string" && previous.split("?")[0] === FEED_PATH) {
    router.back();
  } else {
    router.replace(FEED_PATH);
  }
};
watch(open, (isOpen) => {
  if (!isOpen) {
    closeDialog();
  }
});
</script>

<template>
  <UModal
    v-model:open="open"
    scrollable
    :title="t('feedThread.post', { name: data?.user || '...' })"
    :ui="{ content: 'max-w-3xl', body: 'p-0! sm:p-0!' }"
  >
    <template #body>
      <div v-if="loading" class="flex flex-col gap-4 p-4">
        <USkeleton class="h-6 w-2/3" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
        <USkeleton v-for="n in 4" :key="n" class="h-16 w-full" />
      </div>
      <UEmpty
        v-else-if="error || !data"
        icon="lucide:triangle-alert"
        :title="t('feedThread.loadFailed')"
      >
        <template #actions>
          <UButton :label="t('feedThread.retry')" @click="refresh()" />
        </template>
      </UEmpty>
      <template v-else>
        <div class="p-4 pb-0">
          <ExampleFeedItem :item="data" :openable="false" class="mb-0" />
          <!-- Ask / Show HN text body -->
          <BaseContentText
            v-if="data.content"
            class="px-4 pb-4"
            :content="hackerHtmlToText(data.content)"
            urlify
          />
        </div>
        <div class="px-4 pt-6 pb-4">
          <div class="flex items-center gap-2 pb-4 text-sm font-semibold">
            <Icon name="lucide:message-circle-more" class="size-4" />
            {{ t("feedThread.comments", { count: commentCount }) }}
          </div>
          <div v-if="data.comments?.length">
            <ExampleCommentThread
              v-for="comment in data.comments"
              :key="comment.id"
              :comment="comment"
            />
          </div>
          <p v-else class="py-6 text-center text-sm text-muted">
            {{ t("feedThread.noComments") }}
          </p>
        </div>
      </template>
    </template>
  </UModal>
</template>
