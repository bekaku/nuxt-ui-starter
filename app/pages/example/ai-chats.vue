<script setup lang="ts">
import { ref } from "vue";
import { marked } from "marked";
import { useAiChat } from "~/composables/useAiChat";

definePageMeta({ layout: "default" });
useSeoMeta({ title: "Ai chats page" });

const { messages, status, error, sendMessage, stop } = useAiChat();
const inputMessage = ref("");
const selectedFilters = ref([]);

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

const renderMarkdown = (text: string) => {
  if (!text) return "";
  return marked.parse(text);
};

function onReload() {
  // ถ้าอยาก regenerate คำตอบล่าสุด ต้องเก็บ prompt ล่าสุดไว้ต่างหาก
  // แล้วเรียก sendMessage(lastUserPrompt) ใหม่
}
</script>

<template>
  <UDashboardPanel
    id="ai-chats"
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none' }"
  >
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
                <UChatShimmer :text="`${$t('ai.thinking')}...`" class="text-sm" />
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
                  <span v-else>{{ $t('ai.thinkingShow') }}</span>
                </UButton>

                <template #content>
                  <div
                    class="text-sm text-muted/60 border-l-2 border-(--ui-border) pl-3 py-1 my-2 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0 [&_strong]:font-medium"
                    v-html="renderMarkdown(message.thinkingContent)"
                  />
                </template>
              </UCollapsible>

              <!-- Main answer -->
              <div
                class="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:first:mt-0 prose-p:last:mb-0 prose-pre:my-2 prose-ul:my-1.5 prose-ol:my-1.5"
                v-html="renderMarkdown(message.content)"
              />

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
                  :icon="'i-lucide-file-text'"
                >
                  {{ source.fileName ?? source.title ?? `${$t('ai.source')} ${i + 1}` }}
                </UBadge>
              </div>
            </template>
          </UChatMessages>

          <div class="sticky bottom-0 z-10 pb-4 sm:pb-6">
            <UChatPrompt
              v-model="inputMessage"
              :placeholder="$t('ai.promtLabel')"
              :error="error"
              color="neutral"
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
              {{ $t('ai.aiMistakeable') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
