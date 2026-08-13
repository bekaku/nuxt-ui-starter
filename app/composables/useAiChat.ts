import type { AvatarProps } from '@nuxt/ui'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  parts?: any[]
  name?: string
  avatar?: AvatarProps
  thinkingContent?: string
  isThinkingDone: boolean,
  sources?: any[]
}

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export const useAiChat = () => {
  const messages = ref<ChatMessage[]>([])
  const status = ref<ChatStatus>('ready')
  const error = ref<Error | undefined>(undefined)
  const conversationId = ref<string | null>(null)
  let abortController: AbortController | null = null

  const api = useApi()

  const sendMessage = async (message: string, filterNames: string[] = []) => {
    if (!message.trim()) return

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
      const stream = await api<ReadableStream>('/api/aiRagChat/stream', {
        method: 'POST',
        responseType: 'stream',
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
        currentMsg.content += '\n\n**[เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์]**'
        currentMsg.parts = [{ type: 'text', text: currentMsg.content }]
      }
    } finally {
      abortController = null
    }
  }

  const stop = () => {
    abortController?.abort()
  }

  return {
    messages,
    status,
    error,
    conversationId,
    sendMessage,
    stop
  }
}
