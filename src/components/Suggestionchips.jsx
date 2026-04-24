/**
 * SuggestionChips — quick-action chips shown in the empty state.
 * Props: onSelect(text: string)
 */

const SUGGESTIONS = [
  { icon: '☁️', label: 'What is Urika Cloud?',      color: 'hover:border-orange-300 hover:bg-orange-50' },
  { icon: '📄', label: 'Upload a document',          color: 'hover:border-blue-300   hover:bg-blue-50'   },
  { icon: '🔧', label: 'Show available services',    color: 'hover:border-purple-300 hover:bg-purple-50' },
  { icon: '💡', label: 'How can Urika help me?',     color: 'hover:border-green-300  hover:bg-green-50'  },
  { icon: '📊', label: 'Analyze my data',            color: 'hover:border-amber-300  hover:bg-amber-50'  },
  { icon: '🚀', label: 'Get started with AI',        color: 'hover:border-rose-300   hover:bg-rose-50'   },
]

export default function SuggestionChips({ onSelect }) {
  return (
    <div className="px-4 pb-4 md:px-5">
      <p className="text-[11px] text-gray-400 font-medium mb-2.5 uppercase tracking-wide">Suggestions</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(({ icon, label, color }) => (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className={`
              chip flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              border border-gray-200 bg-white
              text-[13px] text-gray-700 font-medium
              shadow-sm active:scale-95 transition-all duration-150
              ${color}
            `}
          >
            <span className="text-base leading-none" style={{ fontSize: 14 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}