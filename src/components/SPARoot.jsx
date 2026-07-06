import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import '../styles/app.css'

const CLERK_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY

export default function SPARoot() {
  if (!CLERK_KEY || CLERK_KEY === 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Clerk Key Required</h1>
          <p className="text-zinc-400 text-sm mb-4">
            Set your Clerk publishable key in <code className="text-amber-400 bg-zinc-800 px-2 py-0.5 rounded">.env</code>:
          </p>
          <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left text-sm text-zinc-300 overflow-x-auto">
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
          </pre>
          <p className="text-zinc-500 text-xs mt-4">
            Get your key from{' '}
            <a href="https://clerk.com" target="_blank" rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline">clerk.com</a>
          </p>
        </div>
      </div>
    )
  }

  const baseUrl = import.meta.env.BASE_URL

  return (
    <ClerkProvider publishableKey={CLERK_KEY} afterSignInUrl={baseUrl} afterSignUpUrl={baseUrl}>
      <BrowserRouter basename={baseUrl}>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  )
}
