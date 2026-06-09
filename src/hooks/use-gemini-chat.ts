import { useState, useCallback, useRef } from 'react'
import { generateSecureId } from '@/lib/utils'

export interface ChatMessage {
  readonly id: string
  readonly sender: 'user' | 'gemini'
  readonly text: string
  readonly timestamp: Date
}

interface ConversationHistoryItem {
  role: 'user' | 'model'
  parts: [{ text: string }]
}

interface ChatError {
  message: string
  code?: string
}

interface UseGeminiChatReturn {
  readonly messages: readonly ChatMessage[]
  readonly isLoading: boolean
  readonly error: ChatError | null
  readonly sendMessage: (message: string) => Promise<void>
  readonly clearMessages: () => void
  readonly retryLastMessage: () => Promise<void>
}

export function useGeminiChat(): UseGeminiChatReturn {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const lastUserMessageRef = useRef<string>('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const validateMessage = useCallback((message: string): string | null => {
    if (!message || typeof message !== 'string') {
      return 'Message must be a non-empty string'
    }

    const trimmed = message.trim()
    if (trimmed.length === 0) {
      return 'Message cannot be empty'
    }

    if (trimmed.length > 10000) {
      return 'Message is too long (maximum 10,000 characters)'
    }

    // Check for potentially malicious content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /<iframe/i
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return 'Message contains invalid content'
      }
    }

    return null
  }, [])

  const buildConversationHistory = useCallback((currentMessages: readonly ChatMessage[]): ConversationHistoryItem[] => {
    return currentMessages
      .filter(msg => msg.sender === 'user' || msg.sender === 'gemini')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.text }]
      }))
  }, [])

  const addMessage = useCallback((sender: 'user' | 'gemini', text: string): void => {
    const newMessage: ChatMessage = {
      id: generateSecureId(),
      sender,
      text: text.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
  }, [])

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Validate input message
    const validationError = validateMessage(message)
    if (validationError) {
      setError({ message: validationError, code: 'VALIDATION_ERROR' })
      return
    }

    const trimmedMessage = message.trim()
    lastUserMessageRef.current = trimmedMessage

    // Clear previous error
    setError(null)
    setIsLoading(true)

    // Add user message immediately
    addMessage('user', trimmedMessage)

    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      // Build conversation history for context
      const conversationHistory = buildConversationHistory(messages)

      // Make API request
      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          conversationHistory
        }),
        signal: abortControllerRef.current.signal
      })

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.response || typeof data.response !== 'string') {
        throw new Error('Invalid response format from AI service')
      }

      // Add AI response
      addMessage('gemini', data.response)

    } catch (error) {
      // Don't show error if request was aborted (user canceled)
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Chat API error:', error)

      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'

      setError({
        message: errorMessage,
        code: 'API_ERROR'
      })

      // Add error message to chat for user visibility
      addMessage('gemini', `I encountered an error processing your request: ${errorMessage}. Please try again.`)

    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [messages, validateMessage, addMessage, buildConversationHistory])

  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (lastUserMessageRef.current && !isLoading) {
      await sendMessage(lastUserMessageRef.current)
    }
  }, [sendMessage, isLoading])

  const clearMessages = useCallback((): void => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setMessages([])
    setError(null)
    setIsLoading(false)
    lastUserMessageRef.current = ''
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage
  }
}
