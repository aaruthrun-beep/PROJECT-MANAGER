import { Calendar, Image, Video, ExternalLink } from 'lucide-react'

export default function LogEntryCard({ entry, onDelete, onView }) {
  const hasMedia = (entry.images && entry.images.length > 0) || (entry.videos && entry.videos.length > 0)

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={14} />
          {new Date(entry.date || entry.createdAt).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
          })}
        </div>
        <div className="flex gap-2">
          {hasMedia && (
            <span className="flex items-center gap-1 text-xs text-purple-400">
              {entry.images?.length > 0 && <Image size={14} />}
              {entry.videos?.length > 0 && <Video size={14} />}
            </span>
          )}
        </div>
      </div>

      <h4 className="text-white font-medium mb-2">{entry.title}</h4>
      <p className="text-sm text-gray-400 mb-4 line-clamp-3 whitespace-pre-wrap">{entry.content}</p>

      {hasMedia && (
        <div className="flex flex-wrap gap-2 mb-4">
          {entry.images?.slice(0, 3).map((img, i) => (
            <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
          ))}
          {entry.videos?.slice(0, 2).map((vid, i) => (
            <div key={i} className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center border border-white/10">
              <Video size={20} className="text-purple-400" />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-white/5">
        <button onClick={() => onView?.(entry)}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View</button>
        <button onClick={() => onDelete?.(entry.id)}
          className="text-xs text-red-400 hover:text-red-300 transition-colors ml-auto">Delete</button>
      </div>
    </div>
  )
}
