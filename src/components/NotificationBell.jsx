import { useState, useEffect, useRef } from 'react'
import { Bell, BellDot, CheckCheck, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadData, markNotificationRead, markAllNotificationsRead, clearNotifications } from '../data/store'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  const refresh = () => {
    const data = loadData()
    setNotifications(data.notifications || [])
  }

  useEffect(() => { refresh(); const interval = setInterval(refresh, 5000); return () => clearInterval(interval) }, [])
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
        {unread > 0 ? <BellDot size={20} /> : <Bell size={20} />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 mt-2 glass rounded-2xl shadow-2xl w-80 max-h-96 overflow-hidden border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white">Notifications</h4>
              <div className="flex gap-1">
                <button onClick={() => { markAllNotificationsRead(); refresh() }} className="text-xs text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all" title="Mark all read">
                  <CheckCheck size={14} />
                </button>
                <button onClick={() => { clearNotifications(); refresh() }} className="text-xs text-gray-400 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-all" title="Clear all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-72">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Bell size={24} className="mx-auto mb-2 opacity-50" />
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 20).map((n, i) => (
                  <div key={n.id || i} onClick={() => { markNotificationRead(n.id); refresh() }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-0 ${n.read ? 'opacity-60' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'error' ? 'bg-red-400' : n.type === 'success' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                    <p className="text-sm text-gray-300">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
