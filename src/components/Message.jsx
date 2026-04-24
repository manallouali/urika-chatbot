import React, { memo } from 'react'
import logoSrc from '../assets/logo.png'

/** Minimal inline markdown: **bold**, `code`, line breaks */
function renderMarkdown(text) {
  return text.split('\n').map((line, i, arr) => {
    const parts = []
    const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g
    let last = 0, match
    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) parts.push(line.slice(last, match.index))
      if (match[0].startsWith('**')) {
        parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>)
      } else {
        parts.push(
          <code key={match.index} className="font-mono text-[0.8em] bg-black/[0.07] px-1.5 py-0.5 rounded-md">
            {match[3]}
          </code>
        )
      }
      last = match.index + match[0].length
    }
    if (last < line.length) parts.push(line.slice(last))
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>
  })
}

/**
 * Message — single chat bubble.
 * Props: role ('user'|'bot'), text, ts (timestamp)
 */
const Message = memo(function Message({ role, text, ts }) {
  const isUser = role === 'user'
  const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`msg-enter flex gap-2.5 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className="flex-shrink-0 self-end mb-5">
        {isUser ? (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-orange-100 shadow-sm">
            <img src={logoSrc} alt="Urika" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col gap-1 max-w-[78%] md:max-w-[68%] ${isUser ? 'items-end' : 'items-start'}`}>

        {/* Sender label */}
        <span className="text-[11px] font-medium text-gray-400 px-1">
          {isUser ? 'You' : 'Urika'}
        </span>

        {/* Bubble */}
        <div className={`
          relative px-4 py-2.5 text-[14px] leading-relaxed shadow-bubble
          ${isUser
            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-100/80 rounded-2xl rounded-bl-sm'
          }
        `}>
          {renderMarkdown(text)}

          {/* Subtle shimmer on bot messages */}
          {!isUser && (
            <div className="absolute inset-0 rounded-2xl rounded-bl-sm overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-50/20 to-transparent opacity-0" />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 px-1">{time}</span>
      </div>
    </div>
  )
})

export default Message