<script setup lang="ts">
import { ref } from "vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import type { ChatSourceReference } from "~/types/models";
definePageMeta({
  layout: "ai",
});


const { writeToClipboard } = useBase();
const { t } = useLang();
const { isDark } = useTheme();
const inputMessage = ref("");
const selectedFilters = ref([]);
const chatId = useRoute().params.id as string;

const bottomAnchor = useTemplateRef("bottomAnchor");
const {
  conversationId,
  chatTitle,
  messages,
  status,
  error,
  recentDeleteId,
  sendMessage,
  stop,
  initialMessage,
  scrollToBottom,
} = useAiChat({
  bottomAnchor,
});
useSeoMeta({
  title: () => chatTitle.value,
});
onMounted(async () => {
  if (chatId && chatId !== "new") {
    if (isNumericOnly(chatId)) {
      conversationId.value = chatId;
      await initialMessage();
    }
  }
});

const onSubmit = async () => {
  if (
    !inputMessage.value.trim() ||
    status.value === "submitted" ||
    status.value === "streaming"
  ) {
    return;
  }

  const msg = inputMessage.value;
  inputMessage.value = "";
  await sendMessage(msg, selectedFilters.value);
};

// const renderMarkdown = (text: string) => {
//   if (!text) return "";
//   return marked.parse(text);
// };

function onReload() {
  // ถ้าอยาก regenerate คำตอบล่าสุด ต้องเก็บ prompt ล่าสุดไว้ต่างหาก
  // แล้วเรียก sendMessage(lastUserPrompt) ใหม่
}

const test = () => {
  window.history.replaceState(null, "", "/ai-chats/c/99999");
};

const getSourceIcon = (source: ChatSourceReference) => {
  switch (source.type) {
    case "DATABASE_TABLE":
      return "i-lucide-database";
    case "DATABASE_QUERY":
      return "i-lucide-terminal";
    case "DOCUMENT":
    default:
      return "i-lucide-file-text";
  }
};
const getSourceLabel = (source: ChatSourceReference, index: number) => {
  switch (source.type) {
    case "DATABASE_TABLE":
      return source.schema
        ? `${source.schema}.${source.tableName}`
        : (source.tableName ?? "Table");
    case "DATABASE_QUERY":
      if (!source.query) return "SQL Query";
      return source.query.length > 25
        ? `${source.query.slice(0, 25)}...`
        : source.query;
    case "DOCUMENT":
    default:
      return (
        source.fileName ?? source.title ?? `${t("ai.source")} ${index + 1}`
      );
  }
};
const getSourceTooltip = (source: ChatSourceReference) => {
  if (source.type === "DATABASE_QUERY") return source.query;
  if (source.type === "DATABASE_TABLE")
    return `${source.schema}.${source.tableName}`;
  return source.fileName;
};

const getCopyBtn = (item: any) => [
  {
    label: $t("base.copyToClipboard"),
    icon: "i-lucide-copy",
    onSelect() {
      console.log("copy:", item);
    },
  },
];
const onCopyMessage = (event: any, item: any) => {
  console.log("onCopyMessage", item);
  if (item?.parts?.length > 0) {
    const part = item?.parts[0];
    if (part?.text) {
      writeToClipboard(part.text);
    }
  }
};

watch(
  () => recentDeleteId.value,
  () => {
    if (recentDeleteId.value) {
      if (conversationId.value === recentDeleteId.value) {
        recentDeleteId.value = undefined;
        navigateTo("/ai-chats/c/new");
      }
    }
  },
);
</script>

<template>
  <BaseDashboardPanel
    id="ai-chats"
    :title="chatTitle || 'New chat'"
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none' }"
    body-class="w-full max-w-[1440px] mx-auto pt-(--ui-header-height) pb-16 sm:pb-12 flex flex-col flex-1 min-h-0"
  >
    <div class="flex flex-1 justify-center min-h-0">
      <div class="w-full min-w-0 max-w-3xl flex flex-col gap-4 sm:gap-6 px-4">
        <UChatMessages
          ref="chatRef"
          :ui="{
            autoScroll: 'mb-15',
          }"
          :assistant="{
            variant: 'naked',
            actions: [
              {
                label: $t('base.copyToClipboard'),
                icon: 'i-lucide-copy',
                onClick: onCopyMessage,
              },
            ],
          }"
          :user="{
            variant: 'subtle',
            actions: [
              {
                label: $t('base.copyToClipboard'),
                icon: 'i-lucide-copy',
                onClick: onCopyMessage,
              },
            ],
          }"
          should-auto-scroll
          should-scroll-to-bottom
          :messages="messages"
          :status="status"
          class="pt-(--ui-header-height) pb-4 sm:pb-6"
        >
          <template #indicator>
            <div class="flex items-center gap-1.5">
              <UChatShimmer :text="`${$t('ai.thinking')}...`" class="text-sm" />
            </div>
          </template>

          <template #content="{ message }">
            <!-- Thinking block -->
            <UCollapsible
              v-if="message.thinkingContent"
              v-model:open="message.isThinkingOpen"
              class="mb-2"
            >
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-lucide-chevron-down"
                :ui="{
                  trailingIcon:
                    'group-data-[state=open]:rotate-180 transition-transform',
                }"
              >
                <UChatShimmer
                  v-if="!message.isThinkingDone"
                  :text="`${$t('ai.thinking')}...`"
                  :spread="5"
                />
                <span v-else>{{ $t("ai.thinkingShow") }}</span>
              </UButton>

              <template #content>
                <div
                  class="text-sm text-muted/60 border-l-2 border-default pl-3 py-1 my-2 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0 [&_strong]:font-medium"
                >
                  <MdPreview
                    v-if="message.thinkingContent"
                    :modelValue="message.thinkingContent"
                    language="en-US"
                    preview-theme="github"
                    code-theme="github"
                    :show-code-row-number="true"
                    class="think-mode-preview bg-transparent!"
                  />
                </div>
              </template>
            </UCollapsible>

            <!-- Main answer -->
            <div
              class="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:first:mt-0 prose-p:last:mb-0 prose-pre:my-2 prose-ul:my-1.5 prose-ol:my-1.5"
            >
              <MdPreview
                v-if="message.content"
                :modelValue="message.content"
                :theme="isDark ? 'dark' : 'light'"
                language="en-US"
                preview-theme="github"
                code-theme="github"
                :show-code-row-number="true"
                class="bg-transparent!"
                :code-foldable="false"
              />
            </div>

            <!-- Sources -->
            <div
              v-if="message.sources?.length"
              class="mt-3 flex flex-wrap gap-1.5"
            >
              <UBadge
                v-for="(source, i) in message.sources"
                :key="i"
                color="neutral"
                variant="outline"
                size="sm"
                :icon="getSourceIcon(source)"
                :title="getSourceTooltip(source)"
                class="max-w-xs truncate"
              >
                {{ getSourceLabel(source, i) }}
              </UBadge>
            </div>
          </template>
        </UChatMessages>

        <div ref="bottomAnchor" class="h-px w-full opacity-0 shrink-0 scroll-mb-40"></div>
        <div class="sticky bottom-0 z-10 pb-4 sm:pb-6">
          <UChatPrompt
            v-model="inputMessage"
            :placeholder="$t('ai.promtLabel')"
            :error="error"
            color="primary"
            variant="subtle"
            class="[view-transition-name:chat-prompt]"
            :ui="{ base: 'px-1.5' }"
            @submit="onSubmit"
          >
            <template #footer>
              <div class="flex items-center gap-1">
                <UButton size="sm" icon="lucide:search" />
              </div>

              <UChatPromptSubmit
                :status="status"
                size="sm"
                color="primary"
                variant="solid"
                @stop="stop()"
                @reload="onReload()"
              />
            </template>
          </UChatPrompt>

          <p class="text-center text-xs text-muted mt-2">
            {{ $t("ai.aiMistakeable") }}
          </p>
        </div>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
<style>
.md-editor,
.md-editor-preview,
.md-editor-preview p,
.md-editor-preview span,
.md-editor-preview li,
.md-editor-preview h1,
.md-editor-preview h2,
.md-editor-preview h3,
.md-editor-preview h4,
.md-editor-preview h5,
.md-editor-preview h6 {
  font-family: inherit !important;
}
.md-editor-code-head {
  z-index: 1 !important;
}
.md-editor-preview pre,
.md-editor-preview code {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace !important;
}
.md-editor-preview-wrapper {
  padding: 0 !important;
}
.md-editor {
  background-color: transparent !important;
}
.md-editor-dark {
  --md-bk-color: transparent !important;
}

.think-mode-preview .md-editor-preview {
  font-size: 0.85rem !important;
  color: #9ca3af !important;
  line-height: 1.6 !important;
}

.think-mode-preview .md-editor-preview pre {
  opacity: 0.8 !important;
}

.dark .think-mode-preview .md-editor-preview {
  color: #6b7280 !important;
}
</style>
