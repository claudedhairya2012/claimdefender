'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useGeminiChat } from '@/hooks/use-gemini-chat'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/hooks/use-gemini-chat'

interface AIChatDrawerProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export default function AIChatDrawer({ isOpen, onClose }: AIChatDrawerProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage
  } = useGeminiChat()

  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const message = inputMessage.trim()
    if (!message || isLoading) return

    setInputMessage('')
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the entire conversation?')) {
      clearMessages()
    }
  }

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  const getMessageIcon = (message: ChatMessage) => {
    if (message.sender === 'user') {
      return (
        <div className="w-8 h-8 rounded-full bg-midnight-blue/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-midnight-blue">You</span>
        </div>
      )
    }

    return (
      <div className="w-8 h-8 rounded-full bg-midnight-emerald/20 flex items-center justify-center flex-shrink-0">
        <ChatBubbleLeftRightIcon className="w-4 h-4 text-midnight-emerald" />
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight-bg/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-midnight-surface border-l border-midnight-border shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-midnight-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-gradient flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-midnight-text">
                ClaimDefender AI
              </h3>
              <p className="text-xs text-midnight-textMuted">
                Insurance claim analysis assistant
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-2 text-midnight-textMuted hover:text-midnight-error transition-colors rounded-lg hover:bg-midnight-bg"
                title="Clear conversation"
                disabled={isLoading}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-midnight-textMuted hover:text-midnight-text transition-colors rounded-lg hover:bg-midnight-bg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-midnight-bg/50 border-b border-midnight-border">
          <div className="security-indicator">
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            <span>Secure AI-powered insurance analysis</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-midnight-error/10 border-b border-midnight-error/30">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-midnight-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-midnight-error text-sm font-medium">
                  {error.message}
                </div>
                {error.code === 'API_ERROR' && (
                  <button
                    onClick={retryLastMessage}
                    className="inline-flex items-center space-x-1 text-midnight-emerald hover:text-midnight-emeraldHover text-xs underline mt-1"
                    disabled={isLoading}
                  >
                    <ArrowPathIcon className="w-3 h-3" />
                    <span>Retry last message</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-midnight-textMuted mx-auto mb-4" />
              <h4 className="text-midnight-text font-medium mb-2">
                Start a conversation
              </h4>
              <p className="text-midnight-textMuted text-sm leading-relaxed">
                Ask me about your insurance policy, claim denials, appeal strategies, or legal analysis of your documents.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex space-x-3",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === 'gemini' && getMessageIcon(message)}
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                    message.sender === 'user'
                      ? "bg-midnight-blue/20 text-midnight-text"
                      : "bg-midnight-bg border border-midnight-border text-midnight-text"
                  )}
                >
                  <div className="text-sm leading-relaxed">
                    {formatMessageText(message.text)}
                  </div>
                  <div className="text-xs text-midnight-textMuted mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {message.sender === 'user' && getMessageIcon(message)}
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-midnight-emerald/20 flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-midnight-emerald" />
              </div>
              <div className="bg-midnight-bg border border-midnight-border rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-midnight-emerald"></div>
                  <span className="text-sm text-midnight-textMuted">
                    AI is analyzing your request...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-midnight-border">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your insurance claim..."
              rows={1}
              className="flex-1 resize-none bg-midnight-bg border border-midnight-border rounded-lg px-3 py-2 text-midnight-text placeholder-midnight-textMuted focus:ring-2 focus:ring-midnight-emerald focus:border-transparent text-sm"
              disabled={isLoading}
              maxLength={10000}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-3 py-2 midnight-button-primary text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
          <div className="text-xs text-midnight-textMuted mt-2 flex justify-between">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{inputMessage.length}/10,000</span>
          </div>
        </div>
      </div>
    </>
  )
}
