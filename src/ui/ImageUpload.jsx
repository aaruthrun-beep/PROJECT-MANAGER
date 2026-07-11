import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImageToCdn } from '../data/sync'
import toast from 'react-hot-toast'

export default function ImageUpload({ urls, onChange }) {
  const [dragging, setDragging] = useState(false)
  const [localPreviews, setLocalPreviews] = useState([])
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return
    startUploads(files)
  }

  const handleSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return
    startUploads(files)
    e.target.value = ''
  }

  const startUploads = (files) => {
    const entries = files.map(f => ({
      id: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(f),
      file: f,
    }))
    setLocalPreviews(p => [...p, ...entries])

    Promise.allSettled(files.map((file, i) =>
      uploadImageToCdn(file).then(cdnUrl => ({ cdnUrl, id: entries[i].id, localUrl: entries[i].url }))
    )).then(results => {
      const newUrls = [...urls]
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          newUrls.push(r.value.cdnUrl)
          URL.revokeObjectURL(r.value.localUrl)
          toast.success('Image uploaded')
        } else {
          toast.error(r.reason?.message || 'Upload failed')
        }
      })
      onChange(newUrls)
      setLocalPreviews([])
    })
  }

  const removeLocal = (id) => {
    setLocalPreviews(p => {
      const item = p.find(x => x.id === id)
      if (item) URL.revokeObjectURL(item.url)
      return p.filter(x => x.id !== id)
    })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-400 block">Images</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-amber-600 bg-amber-600/10'
            : 'border-zinc-700/60 hover:border-amber-600/30 hover:bg-white/[0.02]'
        }`}
      >
        <div className="flex flex-col items-center gap-1.5 py-2">
          <Upload size={20} className="text-zinc-500" />
          <p className="text-xs text-zinc-500">Drop images here or click to browse</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSelect} />
      </div>
      {(localPreviews.length > 0 || urls.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {localPreviews.map(p => (
            <div key={p.id} className="relative group">
              <img src={p.url} alt="" className="w-16 h-16 object-cover rounded-lg border border-zinc-700/60" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                <Loader2 size={14} className="animate-spin text-white" />
              </div>
              <button onClick={() => removeLocal(p.id)}
                className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-zinc-600 text-white opacity-0 group-hover:opacity-100 transition-all">
                <X size={12} />
              </button>
            </div>
          ))}
          {urls.map((url, i) => (
            <div key={`cdn-${i}`} className="relative group">
              <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-zinc-700/60" />
              <button onClick={() => onChange(urls.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
