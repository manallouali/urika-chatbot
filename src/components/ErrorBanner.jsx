/**
 * ErrorBanner — dismissible error strip.
 * Props: message (string), onClose (() => void)
 */
export default function ErrorBanner({ message, onClose }) {
  if (!message) return null
  return (
    <div className="animate-fade-in mx-4 mb-2 flex items-center gap-3 bg-red-50 border border-red-200/80 text-red-700 text-[13px] px-4 py-2.5 rounded-xl">
      <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <span className="flex-1 leading-snug">{message}</span>
      <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}