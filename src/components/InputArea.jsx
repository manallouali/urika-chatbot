import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * FIX #4: SUGGESTIONS is a module-level constant.
 * It never changes, never clears, never depends on any state.
 */
const SUGGESTIONS = [
  { icon: '☁️', label: 'What is Urika Cloud?'    },
  { icon: '📄', label: 'Upload a document'        },
  { icon: '🔧', label: 'Show available services'  },
  { icon: '💡', label: 'How can Urika help me?'   },
  { icon: '📍', label: 'What is Urika localisation?' },
]

/**
 * InputArea — textarea + attachment + mic + suggestion chips.
 *
 * FIX #4: showChips prop no longer controls mount/unmount.
 * Chips are ALWAYS rendered. showChips=true from parent, always.
 *
 * Props:
 *   onSend    — (text: string) => void
 *   isLoading — bool
 *   showChips — bool (kept for API compat but chips always show)
 */
export default function InputArea({ onSend, isLoading }) {
  const [value,        setValue]    = useState('')
  const [attachedFile, setAttached] = useState(null)
  const [recording,    setRecording] = useState(false)
  const [recSeconds,   setRecSeconds] = useState(0)
  const [micError,     setMicError]  = useState('')

  const textareaRef  = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecRef  = useRef(null)
  const timerRef     = useRef(null)
  const chunksRef    = useRef([])

  const canSend = (value.trim().length > 0 || attachedFile) && !isLoading

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!canSend) return
    let msg = value.trim()
    if (attachedFile) {
      const size = (attachedFile.size / 1024).toFixed(1)
      msg = msg
        ? `${msg}\n\n📎 Attached: ${attachedFile.name} (${size} KB)`
        : `📎 File attached: **${attachedFile.name}** (${size} KB)`
    }
    onSend(msg)
    // FIX #4: only clear textarea + attachment — NOT suggestions
    setValue('')
    setAttached(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [canSend, onSend, value, attachedFile])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px` }
  }

  // ── File ─────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAttached({ name: file.name, size: file.size, type: file.type })
    e.target.value = ''
  }

  // ── Mic ──────────────────────────────────────────────────────
  const startRecording = async () => {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRecRef.current = mr
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob   = new Blob(chunksRef.current, { type: 'audio/webm' })
        const sizekb = (blob.size / 1024).toFixed(1)
        const dur    = recSeconds
        onSend(`🎤 Voice message — ${dur}s, ${sizekb} KB. Please process this audio.`)
        setRecSeconds(0)
      }
      mr.start()
      setRecording(true)
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000)
    } catch (err) {
      setMicError(err.name === 'NotAllowedError'
        ? 'Microphone access denied. Please allow it in your browser.'
        : 'Could not access microphone.')
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    setRecording(false)
    mediaRecRef.current?.stop()
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  return (
    <div className="flex-shrink-0 px-4 pt-3 pb-3 md:px-5 border-t border-gray-100/80 bg-white/95 backdrop-blur-xl rounded-b-2xl">

      {/* Attached file pill */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl animate-fade-in">
          <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32" />
          </svg>
          <span className="flex-1 text-[12px] text-orange-800 font-medium truncate">
            {attachedFile.name}
            <span className="ml-1.5 text-orange-500 font-normal">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
          </span>
          <button onClick={() => setAttached(null)} className="text-orange-400 hover:text-orange-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Mic error */}
      {micError && (
        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-600 animate-fade-in flex items-center gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {micError}
          <button onClick={() => setMicError('')} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Recording indicator */}
      {recording && (
        <div className="mb-2 flex items-center gap-2.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft flex-shrink-0" />
          <span className="text-[12px] text-red-700 font-semibold">Recording {fmtTime(recSeconds)}</span>
          <span className="flex-1 text-[11px] text-red-400">Click mic to stop</span>
        </div>
      )}

      {/* Input row */}
      <div className={`
        flex items-end gap-2 bg-gray-50 border rounded-2xl px-3 py-2.5
        transition-all duration-200
        ${isLoading
          ? 'border-gray-200'
          : 'border-gray-200 hover:border-orange-200 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-input'
        }
      `}>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json" />

        {/* Attachment */}
        <button type="button" title="Attach file" onClick={() => fileInputRef.current?.click()}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 mb-0.5
            ${attachedFile ? 'text-orange-500 bg-orange-100' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </button>

        {/* Textarea */}
        <textarea ref={textareaRef} value={value} onChange={handleChange} onKeyDown={handleKeyDown}
          disabled={isLoading} rows={1}
          placeholder={recording ? 'Recording… click mic to stop' : isLoading ? 'Urika is thinking…' : attachedFile ? 'Add a message (optional)…' : 'Ask Urika anything…'}
          className="flex-1 bg-transparent outline-none text-[14px] text-gray-800 placeholder-gray-400 font-sans leading-relaxed py-1 disabled:opacity-50 disabled:cursor-not-allowed" />

        {/* Mic */}
        <button type="button" title={recording ? 'Stop recording' : 'Voice message'}
          onClick={recording ? stopRecording : startRecording}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 mb-0.5
            ${recording ? 'text-white bg-red-500 hover:bg-red-600 animate-pulse-soft' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}>
          {recording
            ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
          }
        </button>

        {/* Send */}
        <button onClick={handleSubmit} disabled={!canSend} aria-label="Send message"
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5
            ${canSend ? 'bg-orange-500 text-white shadow-btn hover:bg-orange-600 hover:shadow-btn-hover hover:scale-105 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          {isLoading
            ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            : <svg className="w-3.5 h-3.5 translate-x-px" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          }
        </button>
      </div>

      {/*
        FIX #4: Chips are ALWAYS rendered here.
        No conditional, no state dependency.
        They are a constant list from module scope — they will never disappear.
      */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map(({ icon, label }) => (
          <button
            key={label}
            onClick={() => onSend(label)}
            className="chip flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-[12px] text-gray-600 font-medium shadow-sm hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 active:scale-95 transition-all duration-150"
          >
            <span style={{ fontSize: 13 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-2 leading-none">
        <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for newline
      </p>
    </div>
  )
}