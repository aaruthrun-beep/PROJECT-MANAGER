import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImageToCdn } from '../data/sync'
import toast from 'react-hot-toast'

export default function ImageUpload({ urls, onChange }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return
    await uploadFiles(files)
  }

  const handleSelect = async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return
    await uploadFiles(files)
    e.target.value = ''
  }

  const uploadFiles = async (files) => {
    setUploading(true)
    const newUrls = [...urls]
    for (const file of files) {
      try {
        const url = await uploadImageToCdn(file)
        newUrls.push(url)
        toast.success(`${file.name} uploaded`)
      } catch (err) {
        toast.error(`${file.name}: ${err.message}`)
      }
    }
    onChange(newUrls)
    setUploading(false)
  }

  const removeUrl = (idx) => {
    onChange(urls.filter((_, i) => i !== idx))
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
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-zinc-400 py-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <Upload size={20} className="text-zinc-500" />
            <p className="text-xs text-zinc-500">Drop images here or click to browse</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSelect} />
      </div>
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-zinc-700/60" />
              <button onClick={() => removeUrl(i)}
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
