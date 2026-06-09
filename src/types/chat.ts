export interface AIChatMessage {
  readonly id: string
  readonly sender: 'user' | 'gemini'
  readonly text: string
  readonly timestamp: Date
}

export interface ChatError {
  readonly message: string
  readonly code?: 'VALIDATION_ERROR' | 'API_ERROR' | 'NETWORK_ERROR'
}

export interface ChatContextValue {
  readonly messages: readonly AIChatMessage[]
  readonly isLoading: boolean
  readonly error: ChatError | null
  readonly sendMessage: (message: string) => Promise<void>
  readonly clearMessages: () => void
  readonly retryLastMessage: () => Promise<void>
}

export interface GeminiResponse {
  response: string
  error?: never
}

export interface GeminiErrorResponse {
  error: string
  response?: never
}
