import { useState, useCallback } from 'react'
import { sendMessage, clearSession } from '../utils/api'

const WELCOME = {
  id:   'welcome',
  role: 'bot',
  text: "Hello! I'm **Urika**, your intelligent Cloud AI assistant.\n\nWhat can I help you with today?",
  ts:   Date.now(),
}

export function useChat() {
  const [messages,  setMessages]  = useState([WELCOME])
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState(null)
  const [handoff,   setHandoff]   = useState(false)

  const push = useCallback((msg) => setMessages(prev => [...prev, msg]), [])

  const send = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    setError(null)
    setHandoff(false)
    push({ id: `user-${Date.now()}`, role: 'user', text: trimmed, ts: Date.now() })
    setIsLoading(true)
    try {
      const data = await sendMessage(trimmed)
      if (data.type === 'handoff') {
        push({ id: `bot-${Date.now()}`, role: 'bot', text: '🔄 Connecting you to a human agent...', ts: Date.now(), isHandoff: true })
        setHandoff(true)
      } else {
        push({ id: `bot-${Date.now()}`, role: 'bot', text: data.reply, ts: Date.now() })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, push])

  const clearChat = useCallback(() => {
    clearSession()
    setMessages([{ ...WELCOME, ts: Date.now() }])
    setError(null)
    setHandoff(false)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { messages, isLoading, error, handoff, send, clearChat, clearError }
}