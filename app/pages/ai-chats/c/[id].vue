<script setup lang="ts">
import { ref } from "vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import type { ChatSourceReference } from "~/types/models";
definePageMeta({
  layout: "ai",
});
const {
  conversationId,
  chatTitle,
  messages,
  status,
  error,
  sendMessage,
  stop,
} = useAiChat();

useSeoMeta({
  title: () => chatTitle.value,
});
const { t } = useLang();
const { isDark } = useTheme();
const inputMessage = ref("");
const selectedFilters = ref([]);
const chatId = useRoute().params.id as string;

onMounted(() => {
  if (chatId && chatId !== "new") {
    conversationId.value = chatId;
  }
});

const onSubmit = async () => {
  if (
    !inputMessage.value.trim() ||
    status.value === "submitted" ||
    status.value === "streaming"
  )
    return;
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
</script>

<template>
  <UDashboardPanel
    id="ai-chats"
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none' }"
  >
    <template #header>
      <UDashboardNavbar :title="chatTitle || 'New chat'" />
    </template>
    <template #body>
      <div class="flex flex-1 justify-center min-h-0">
        <div class="w-full min-w-0 max-w-3xl flex flex-col gap-4 sm:gap-6 px-4">
          <UChatMessages
            should-auto-scroll
            :messages="messages"
            :status="status"
            class="pt-(--ui-header-height) pb-4 sm:pb-6"
          >
            <template #indicator>
              <div class="flex items-center gap-1.5">
                <UChatShimmer
                  :text="`${$t('ai.thinking')}...`"
                  class="text-sm"
                />
              </div>
            </template>

            <template #content="{ message }">
              <!-- Thinking block -->
              <UCollapsible v-if="message.thinkingContent" class="mb-2">
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
                    class="text-sm text-muted/60 border-l-2 border-(--ui-border) pl-3 py-1 my-2 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0 [&_strong]:font-medium"
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
                  <!-- <div
                    class="text-sm text-muted/60 border-l-2 border-(--ui-border) pl-3 py-1 my-2 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0 [&_strong]:font-medium"
                    v-html="renderMarkdown(message.thinkingContent)"
                  /> -->
                </template>
              </UCollapsible>

              <!-- Main answer -->
              <!-- <div
                class="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:first:mt-0 prose-p:last:mb-0 prose-pre:my-2 prose-ul:my-1.5 prose-ol:my-1.5"
                v-html="renderMarkdown(message.content)"
              /> -->
              <div
                class="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:first:mt-0 prose-p:last:mb-0 prose-pre:my-2 prose-ul:my-1.5 prose-ol:my-1.5"
              >
                <!-- <BaseMarkdownPreview :content="message.content" /> -->
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
                <!-- <UBadge
                  v-for="(source, i) in message.sources"
                  :key="i"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :icon="'i-lucide-file-text'"
                >
                  {{
                    source.fileName ??
                    source.title ??
                    `${$t("ai.source")} ${i + 1}`
                  }}
                </UBadge> -->
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
    </template>
  </UDashboardPanel>
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
  font-style: italic !important;
  line-height: 1.6 !important;
}

.think-mode-preview .md-editor-preview pre {
  opacity: 0.8 !important;
}

.dark .think-mode-preview .md-editor-preview {
  color: #6b7280 !important;
}
</style>
