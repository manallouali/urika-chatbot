import { useEffect, useRef } from 'react'
import Message from './Message'
import TypingIndicator from './TypingIndicator'

/**
 * ChatBox — scrollable message list with auto-scroll.
 * Props: messages[], isLoading
 */
export default function ChatBox({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-5 space-y-5 bg-surface-50/60">
      {messages.map((msg) => (
        <Message key={msg.id} role={msg.role} text={msg.text} ts={msg.ts} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} className="h-1" />
    </div>
  )
}