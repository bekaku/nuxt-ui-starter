<script setup lang="ts">
import type { FeedComment } from "~/types";

const MAX_INDENT_DEPTH = 6;
const props = withDefaults(
  defineProps<{
    comment: FeedComment;
    depth?: number;
  }>(),
  { depth: 0 },
);
const { t } = useLang();
const collapsed = ref(false);
// Replies stay hidden until the user asks for them
const showReplies = ref(false);

const text = computed(() => hackerHtmlToText(props.comment.content));
const isRemoved = computed(
  () => props.comment.dead || props.comment.deleted || !text.value,
);
const countReplies = (items: FeedComment[]): number =>
  items.reduce((sum, item) => sum + 1 + countReplies(item.comments || []), 0);
const replyCount = computed(() => countReplies(props.comment.comments || []));
</script>

<template>
  <div class="flex gap-2">
    <div class="flex w-6 shrink-0 flex-col items-center">
      <UAvatar :alt="comment.user || '?'" size="xs" />
      <button
        v-if="!collapsed && depth < MAX_INDENT_DEPTH"
        type="button"
        :aria-label="t('feedThread.collapse')"
        class="group mt-1 flex w-4 flex-1 cursor-pointer justify-center"
        @click="collapsed = true"
      >
        <span
          class="w-0.5 rounded-full bg-accented transition-colors group-hover:bg-primary"
        />
      </button>
    </div>
    <div class="min-w-0 flex-1 pb-3">
      <div class="flex items-center gap-1.5 text-xs">
        <span class="font-semibold text-highlighted">
          {{ comment.user || t("feedThread.deleted") }}
        </span>
        <span class="text-muted">· {{ comment.time_ago }}</span>
        <UButton
          v-if="collapsed"
          size="xs"
          variant="link"
          color="neutral"
          icon="lucide:chevrons-up-down"
          :label="
            replyCount > 0
              ? t('feedThread.moreReplies', { count: replyCount })
              : t('feedThread.expand')
          "
          @click="collapsed = false"
        />
      </div>
      <template v-if="!collapsed">
        <p v-if="isRemoved" class="py-1 text-sm text-dimmed italic">
          {{ t("feedThread.deleted") }}
        </p>
        <BaseContentText
          v-else
          class="py-1"
          text-class="text-sm wrap-break-word"
          :content="text"
          urlify
        />
        <UButton
          v-if="comment.comments?.length"
          size="xs"
          variant="link"
          color="neutral"
          class="px-0"
          :icon="showReplies ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          :label="
            showReplies
              ? t('feedThread.hideReplies')
              : t('feedThread.viewReplies', { count: replyCount })
          "
          @click="showReplies = !showReplies"
        />
        <div
          v-if="showReplies && comment.comments?.length"
          class="mt-2"
          :class="{ '-ml-8': depth >= MAX_INDENT_DEPTH }"
        >
          <ExampleCommentThread
            v-for="child in comment.comments"
            :key="child.id"
            :comment="child"
            :depth="depth + 1"
          />
        </div>
      </template>
    </div>
  </div>
</template>
