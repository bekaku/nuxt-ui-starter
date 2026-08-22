import type { ApiResponse } from '~/types/common'
import type { AiChat, AiChatMessage, ChatMessage } from '~/types/models'



export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'
export type ChatAction = 'delete' | 'rename'


interface AiChatOptions {
  bottomAnchor?: Ref<HTMLElement | null>
  chatContainerRef?: Ref<HTMLElement | null>
}

export const useAiChat = (options: AiChatOptions = {}) => {
  const { t } = useLang()
  const recentChats = useState<AiChat[]>('ai:recent', () => []);
  const chatAction = useState<ChatAction | undefined>('ai:chat:action', () => undefined);
  const chatActionItem = useState<AiChat | undefined>('ai:chat:item', () => undefined);
  const currentChat = ref<AiChat | undefined>({
    title: t('chats.newChat'),
    updatedDate: '',
    pin: false
  });

  const chatTitle = ref(t('chats.newChat'))



  const status = ref<ChatStatus>('ready')
  const error = ref<Error | undefined>(undefined)

  const confirm = useConfirmDialog();
  const conversationId = ref<string | null>(null)
  let abortController: AbortController | null = null

  const { onReplaceUrl } = useBase();
  const api = useApi()

  const messages = ref<ChatMessage[]>([])
  const loading = ref(true);
  const loadingMore = ref(false)
  const page = ref(0)
  const size = ref(10)
  const isLastPage = ref(true)
  const initialMessage = async () => {
    if (!conversationId.value) {
      return;
    }

    try {
      // @ts-ignore
      const response = await api<ApiResponse<AiChatMessage>>(
        `api/aiChat/messages/${conversationId.value}?page=${page.value}&sort=id,desc&size=${size.value}` as string,
        { method: 'GET' }
      )
      isLastPage.value = response.last;
      if (response?.dataList?.length) {
        // @ts-ignore
        messages.value = [...response.dataList]
          .reverse()
          .map((message) => ({
            id: message.id,
            role: message.aiRole,
            content: message.content,
            parts: [
              {
                type: 'text',
                text: message.content
              }
            ],
            thinkingContent: undefined,
            isThinkingDone: true,
            isThinkingOpen: false,
            avatar: message.aiRole === 'assistant'
              ? {
                icon: 'hugeicons:ai-magic',
                color: 'primary'
              }
              : undefined,
            sources: []
          }))
      }

      if (recentChats.value && recentChats.value.length > 0) {
        const chat = recentChats.value.find((item) => item.id === conversationId.value);
        if (chat) {
          currentChat.value = chat;
        }
      }

    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      loading.value = false;
    }
  }

  function getScrollParent(node: HTMLElement | null): HTMLElement | null {
    let parent = node?.parentElement ?? null
    while (parent) {
      const { overflowY } = getComputedStyle(parent)
      if (/(auto|scroll)/.test(overflowY) && parent.scrollHeight > parent.clientHeight) {
        return parent
      }
      parent = parent.parentElement
    }
    return document.scrollingElement as HTMLElement | null
  }
  const loadMoreMessages = async () => {
    if (!conversationId.value || isLastPage.value || loadingMore.value) return;

    loadingMore.value = true;
    page.value++;

    try {
      // @ts-ignore
      const response = await api<ApiResponse<AiChatMessage>>(
        `api/aiChat/messages/${conversationId.value}?page=${page.value}&sort=id,desc&size=${size.value}`,
        { method: 'GET' }
      );

      isLastPage.value = response.last;

      if (response?.dataList?.length) {
        const olderMessages = [...response.dataList]
          .reverse() // reverse because the response is already sorted by sort=id,desc
          .map((message) => ({
            id: message.id,
            role: message.aiRole,
            content: message.content,
            parts: [{ type: 'text', text: message.content }],
            thinkingContent: undefined,
            isThinkingDone: true,
            isThinkingOpen: false,
            avatar: message.aiRole === 'assistant'
              ? { icon: 'hugeicons:ai-magic', color: 'primary' }
              : undefined,
            sources: []
          }));

        const scrollContainer = getScrollParent(options?.chatContainerRef?.value ?? null);
        const previousScrollHeight = scrollContainer ? scrollContainer.scrollHeight : 0;

        messages.value = [...olderMessages, ...messages.value] as any;

        await nextTick();
        if (scrollContainer) {
          const currentScrollHeight = scrollContainer.scrollHeight;
          scrollContainer.scrollTop += (currentScrollHeight - previousScrollHeight);
        }
      }
    } catch (error) {
      console.error('Failed to fetch more messages', error);
      page.value--;
    } finally {
      loadingMore.value = false;
    }
  }

  const sendMessage = async (message: string, filterNames: string[] = []) => {
    if (!message.trim()) return

    const isNewChat = !conversationId.value;

    error.value = undefined
    status.value = 'submitted'

    const userMsgId = Date.now().toString()
    const aiMsgId = (Date.now() + 1).toString()

    messages.value.push({
      id: userMsgId,
      role: 'user',
      content: message,
      parts: [{ type: 'text', text: message }],
      isThinkingDone: false,
      isThinkingOpen: false
    })

    const aiMessageIndex = messages.value.length

    messages.value.push({
      id: aiMsgId,
      role: 'assistant',
      content: '',
      parts: [{ type: 'text', text: '' }],
      thinkingContent: '',
      avatar: { icon: 'hugeicons:ai-magic', color: 'primary' },
      isThinkingDone: false,
      isThinkingOpen: false
    })
    scrollToBottom();

    abortController = new AbortController()

    try {
      const stream = await api<ReadableStream>('/api/aiChat/stream', {
        method: 'POST',
        responseType: 'stream', // useApi จะคืนค่ากลับมาเป็น Stream ให้
        headers: { Accept: 'text/event-stream' },
        signal: abortController.signal,
        body: {
          message,
          conversationId: conversationId.value,
          filterNames
        }
      })

      if (!stream) throw new Error('No stream returned from server')

      const reader = stream.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.replace(/^data:\s*/, '').trim()
              if (!jsonStr) continue

              try {
                const event = JSON.parse(jsonStr)

                if (event.type === 'chat_id') {
                  conversationId.value = event.content
                  // router.replace(`/ai-chats/c/${event.content}`)
                  onReplaceUrl(`/ai-chats/c/${event.content}`)
                  continue
                }
                if (event.type === 'title') {
                  chatTitle.value = event.content
                  continue
                }

                const currentMsg = messages.value[aiMessageIndex]
                if (!currentMsg) continue

                if (status.value !== 'streaming') status.value = 'streaming'

                if (event.type === 'thinking') {
                  currentMsg.thinkingContent += event.content
                  currentMsg.isThinkingOpen = true
                }
                else if (event.type === 'token') {
                  if (!currentMsg.isThinkingDone) {
                    currentMsg.isThinkingDone = true
                    currentMsg.isThinkingOpen = false
                  }
                  if (!event.content.includes('<think>') && !event.content.includes('</think>')) {
                    currentMsg.content += event.content
                    currentMsg.parts = [{ type: 'text', text: currentMsg.content }]
                  }
                }
                else if (event.type === 'sources') {
                  currentMsg.sources = JSON.parse(event.content)
                }
                else if (event.type === 'done') {
                  conversationId.value = event.content
                  currentMsg.isThinkingDone = true
                  currentMsg.isThinkingOpen = false

                  const thinkMatch = currentMsg.content.match(/<think>([\s\S]*?)<\/think>/)
                  if (thinkMatch && thinkMatch[1]) {
                    currentMsg.thinkingContent = thinkMatch[1].trim()
                    currentMsg.content = currentMsg.content.replace(/<think>[\s\S]*?<\/think>/, '').trim()
                    currentMsg.parts = [{ type: 'text', text: currentMsg.content }]
                  }
                }
              } catch (e) {
                console.warn('Failed to parse stream JSON:', jsonStr)
              }
            }
          }
        }
      }

      if (isNewChat && conversationId.value) {
        currentChat.value = {
          id: conversationId.value,
          title: chatTitle.value,
          updatedDate: new Date().toISOString(),
          pin: false
        }
        recentChats.value.unshift(currentChat.value);
      }

      status.value = 'ready'
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        status.value = 'ready'
        return
      }
      console.error('Chat error:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      status.value = 'error'
      const currentMsg = messages.value[aiMessageIndex]
      if (currentMsg) {
        currentMsg.isThinkingDone = true
        currentMsg.isThinkingOpen = false
        currentMsg.content += `\n\n**[${t('error.internalServererror')}]**`
        currentMsg.parts = [{ type: 'text', text: currentMsg.content }]
      }
    } finally {
      abortController = null
    }
  }

  const stop = () => {
    abortController?.abort()
  }


  const getItemById = (chatId: string) => recentChats.value.find((item) => item.id === chatId)

  const onPin = async (chatId: string) => {
    const item = getItemById(chatId);
    if (item) {
      item.pin = true;
      await onUpdateChat(item);
    }
  };
  const onUnPin = async (chatId: string) => {
    const item = getItemById(chatId);
    if (item) {
      item.pin = false;
      await onUpdateChat(item);
    }
  };

  const onRenameChat = async (chat: AiChat) => {
    if (chat && chat.id) {
      await onUpdateChat(chat);
      const item = getItemById(chat.id as string);
      if (item) {
        item.title = chat.title;
      }
      chatAction.value = 'rename'
      chatActionItem.value = item
    }
  };
  const onDeleteChat = async (id: string) => {
    const conf = await confirm({
      title: t("base.deleteCountConfirm", { count: 1 }),
      description: t("base.deleteConfirmHelp"),
      confirmButton: {
        label: t("base.delete"),
        color: "error",
        icon: "lucide:trash",
      },
    });
    if (!conf) {
      return
    }
    try {
      await api<void>(`/api/aiChat/${id}`, {
        method: 'DELETE',
      });
      const item = getItemById(id as string);
      chatActionItem.value = item
      chatAction.value = 'delete'
      recentChats.value = recentChats.value.filter((item) => item.id !== id);

    } catch (error) {
      console.error('Failed', error);
    }
  }

  const onUpdateChat = async (item: AiChat) => {

    try {
      await api<void>(`/api/aiChat/${item.id}`, {
        method: 'PUT',
        body: item
      });

    } catch (error) {
      console.error('Failed', error);
    }
  }

  const scrollToBottom = async () => {
    await nextTick();
    setTimeout(() => {
      if (options.bottomAnchor?.value) {
        options.bottomAnchor.value.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 100);
  };

  return {
    recentChats,
    messages,
    status,
    error,
    conversationId,
    loading,
    loadingMore,
    chatAction,
    chatActionItem,
    currentChat,
    isLastPage,
    getItemById,
    sendMessage,
    stop,
    onPin,
    onUnPin,
    onDeleteChat,
    initialMessage,
    scrollToBottom,
    onUpdateChat,
    onRenameChat,
    loadMoreMessages
  }
}
