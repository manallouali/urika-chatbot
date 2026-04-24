import logoSrc from '../assets/logo.png'
import { useChat } from '../hooks/useChat.js'
import ChatHeader  from '../components/ChatHeader'
import ChatBox     from '../components/ChatBox'
import InputArea   from '../components/InputArea'
import ErrorBanner from '../components/ErrorBanner'

/**
 * ChatPage
 *
 * FIX #4: showChips is now ALWAYS true — suggestions never disappear.
 * Suggestions are a persistent UI feature, not tied to chat state.
 */
export default function ChatPage() {
  const { messages, isLoading, error, handoff, send, clearChat, clearError } = useChat()

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 md:p-10"
      style={{
        background: `
          radial-gradient(ellipse 100% 80% at 50% -8%, rgba(251,146,60,0.13) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 110%, rgba(249,115,22,0.06) 0%, transparent 55%),
          #f5f4f2
        `,
      }}
    >
      {/* Dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.055) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Wordmark */}
      <div className="relative mb-5 flex items-center gap-2.5 animate-fade-in">
        <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-orange-100 shadow-card">
          <img src={logoSrc} alt="Urika" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold text-gray-900 tracking-tight">
            urika<span className="text-orange-500">.</span>cloud
          </span>
          <span className="text-[10px] text-gray-400 font-medium -mt-0.5">AI Assistant Platform</span>
        </div>
        <span className="ml-1 text-[10px] bg-orange-500 text-white font-semibold px-2 py-0.5 rounded-full shadow-sm">PRO</span>
      </div>

      {/* Chat card */}
      <div
        className="relative w-full max-w-2xl flex flex-col glass rounded-2xl shadow-chat border border-white/80 overflow-hidden animate-scale-in"
        style={{ height: 'min(700px, calc(100vh - 180px))' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent pointer-events-none" />

        <ChatHeader onClear={clearChat} />

        <ChatBox messages={messages} isLoading={isLoading} />

        {/* FIX #3: Handoff banner */}
        {handoff && (
          <div className="mx-4 mb-2 flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 text-[13px] px-4 py-2.5 rounded-xl animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
            <span>A human agent will join this conversation shortly.</span>
          </div>
        )}

        <ErrorBanner message={error} onClose={clearError} />

        {/* FIX #4: showChips=true always — never pass a conditional here */}
        <InputArea onSend={send} isLoading={isLoading} showChips={true} />
      </div>

      <p className="relative mt-4 text-[11px] text-gray-400 text-center animate-fade-in">
        Urika Cloud AI · Responses may not always be accurate ·{' '}
        <a href="#" className="text-orange-400 hover:text-orange-500 transition-colors">Privacy</a>
      </p>
    </div>
  )
}