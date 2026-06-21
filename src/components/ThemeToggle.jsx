import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Tooltip from '../ui/Tooltip'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const themes = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ]

  return (
    <Tooltip content={`Theme: ${theme}`}>
      <div className="flex items-center glass rounded-xl p-0.5 border border-white/10">
        {themes.map(({ value, icon: Icon }) => (
          <button key={value} onClick={() => setTheme(value)}
            className={`p-1.5 rounded-lg transition-all ${theme === value ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-white'}`}>
            <Icon size={16} />
          </button>
        ))}
      </div>
    </Tooltip>
  )
}
