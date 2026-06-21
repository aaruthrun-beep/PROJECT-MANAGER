import { Calendar, Image, Video, Share2, Pin, PenLine } from 'lucide-react'
import toast from 'react-hot-toast'

const moodEmojis = { productive: '🚀', struggling: '😤', neutral: '😐', breakthrough: '💡', learning: '📚' }
const moodColors = { productive: 'text-emerald-400', struggling: 'text-red-400', neutral: 'text-gray-400', breakthrough: 'text-purple-400', learning: 'text-sky-400' }

export default function LogEntryCard({ entry, onDelete, onView, onEdit, onPin, compact }) {
  const hasMedia = (entry.images && entry.images.length > 0) || (entry.videos && entry.videos.length > 0)

  const handleShare = async (e) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}${window.location.pathname}#log-${entry.id}`
    const shareData = {
      title: entry.title,
      text: entry.content ? entry.content.slice(0, 200) : 'Check out this log entry',
      url: shareUrl,
    }
    if (navigator.share) {
      try { await navigator.share(shareData); return } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.success('Share URL: ' + shareUrl)
    }
  }

  return (
    <div className={`bg-white/5 border rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all ${entry.pinned ? 'border-amber-500/30 hover:border-amber-500/40' : 'border-white/10 hover:border-indigo-500/30'}`}>
      {entry.pinned && (
        <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-2">
          <Pin size={10} /> Pinned
        </div>
      )}
      {!compact && (
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 flex-wrap">
            <Calendar size={14} className="shrink-0" />
            {new Date(entry.date || entry.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
            {entry.mood && <span className={moodColors[entry.mood]}>{moodEmojis[entry.mood]}</span>}
          </div>
          <div className="flex gap-1 sm:gap-2 shrink-0">
            {hasMedia && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-purple-400">
                {entry.images?.length > 0 && <Image size={13} />}
                {entry.videos?.length > 0 && <Video size={13} />}
              </span>
            )}
          </div>
        </div>
      )}

      <h4 className="text-white font-medium text-sm sm:text-base mb-1.5">{entry.title}</h4>
      {entry.content && (
        <p className="text-xs sm:text-sm text-gray-400 mb-3 line-clamp-3 whitespace-pre-wrap">{entry.content}</p>
      )}

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {entry.tags.map((tag, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">{tag}</span>
          ))}
        </div>
      )}

      {hasMedia && !compact && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
          {entry.images?.slice(0, 3).map((img, i) => (
            <img key={i} src={img} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg border border-white/10" />
          ))}
          {entry.videos?.slice(0, 2).map((vid, i) => (
            <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-800 rounded-lg flex items-center justify-center border border-white/10">
              <Video size={18} className="text-purple-400" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 sm:gap-2 pt-2.5 border-t border-white/5 mt-2">
        <button onClick={() => onView?.(entry)}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-500/10 active:scale-95">
          View
        </button>
        {onEdit && (
          <button onClick={() => onEdit(entry)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5 active:scale-95">
            <PenLine size={12} /> Edit
          </button>
        )}
        <button onClick={handleShare}
          className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors px-2 py-1 rounded-lg hover:bg-sky-500/10 active:scale-95">
          <Share2 size={12} /> Share
        </button>
        {onPin && (
          <button onClick={() => onPin(entry)}
            className={`text-xs transition-colors px-2 py-1 rounded-lg active:scale-95 ${entry.pinned ? 'text-amber-400 hover:text-amber-300 bg-amber-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Pin size={12} />
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(entry.id)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 active:scale-95 ml-auto">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
