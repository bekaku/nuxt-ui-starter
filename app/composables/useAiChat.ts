import type { AvatarProps } from '@nuxt/ui'
import type { AnyARecord } from 'node:dns'
import type { ApiResponse } from '~/types/common'
import type { AiChat, AiChatMessage, AiRole, ChatMessage } from '~/types/models'



export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export const useAiChat = () => {

  const recentChats = useState<AiChat[]>('ai:recent', () => []);
  const messages = ref<ChatMessage[]>([])
  const status = ref<ChatStatus>('ready')
  const error = ref<Error | undefined>(undefined)
  const { t } = useLang()
  const conversationId = ref<string | null>(null)
  let abortController: AbortController | null = null

  const { onReplaceUrl } = useBase();
  const api = useApi()
  const chatTitle = ref<string>(t('chats.newChat'))

  const loading = ref(true);
  const page = ref(0)
  const size = ref(10)
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
            avatar: message.aiRole === 'assistant'
              ? {
                icon: 'hugeicons:ai-magic',
                color: 'primary'
              }
              : undefined,
            sources: []
          }))
      }

    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      loading.value = false;
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
      isThinkingDone: false
    })

    const aiMessageIndex = messages.value.length

    messages.value.push({
      id: aiMsgId,
      role: 'assistant',
      content: '',
      parts: [{ type: 'text', text: '' }],
      thinkingContent: '',
      avatar: { icon: 'hugeicons:ai-magic', color: 'primary' },
      isThinkingDone: false
    })

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
                }
                else if (event.type === 'token') {
                  if (!currentMsg.isThinkingDone) currentMsg.isThinkingDone = true
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
        recentChats.value.unshift({
          id: conversationId.value,
          title: chatTitle.value,
          updatedDate: new Date().toISOString(),
          pin: false
        });
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


  const onPin = (chatId: string) => {
    const item = recentChats.value.find((item) => item.id === chatId);
    if (item) {
      item.pin = true;
    }
  };
  const onUnPin = (chatId: string) => {
    const item = recentChats.value.find((item) => item.id === chatId);
    if (item) {
      item.pin = false;
    }
  };

  return {
    recentChats,
    messages,
    status,
    error,
    conversationId,
    chatTitle,
    loading,
    sendMessage,
    stop,
    onPin,
    onUnPin,
    initialMessage
  }
}
