import logoSrc from '../assets/logo.png'

/**
 * TypingIndicator — "Urika is typing..." with animated dots.
 */
export default function TypingIndicator() {
  return (
    <div className="msg-enter flex gap-2.5 w-full flex-row">

      {/* Avatar */}
      <div className="flex-shrink-0 self-end mb-5">
        <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-orange-100 shadow-sm">
          <img src={logoSrc} alt="Urika" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex flex-col gap-1 items-start">
        <span className="text-[11px] font-medium text-gray-400 px-1">Urika</span>

        {/* Bubble */}
        <div className="bg-white border border-gray-100/80 shadow-bubble rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
          {/* Animated dots */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ animationDelay: `${i * 0.18}s` }}
              className={`block w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce-dot dot-${i + 1}`}
            />
          ))}
          <span className="ml-1.5 text-[12px] text-gray-400 font-medium">Typing...</span>
        </div>
      </div>
    </div>
  )
}