import logoSrc from '../assets/logo.png'

/**
 * ChatHeader — premium SaaS-style top bar.
 * Avatar, brand name, live status, action buttons.
 */
export default function ChatHeader({ onClear, onToggleDark, isDark }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-100/80 bg-white/95 backdrop-blur-xl rounded-t-2xl">

      {/* LEFT — avatar + name + status */}
      <div className="flex items-center gap-3">
        {/* Avatar with online ring */}
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-orange-100 shadow-sm">
            <img src={logoSrc} alt="Urika" className="w-full h-full object-cover" />
          </div>
          {/* Animated online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-600 font-semibold text-gray-900 tracking-tight leading-none">Urika</p>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 leading-none">AI</span>
          </div>
          <p className="text-[11px] text-emerald-500 font-medium mt-0.5 flex items-center gap-1 leading-none">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            Online · Ready to help
          </p>
        </div>
      </div>

      {/* RIGHT — action buttons */}
      <div className="flex items-center gap-1">

        {/* Model badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-100 mr-2">
          <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-[11px] font-semibold text-orange-600">Urika Pro</span>
        </div>

        {/* New chat */}
        {onClear && (
          <button
            onClick={onClear}
            title="New conversation"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-150 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}

        {/* More options */}
        <button
          title="Options"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-150 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}