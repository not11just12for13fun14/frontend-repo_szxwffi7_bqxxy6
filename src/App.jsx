import { useState } from 'react'
import Hero from './components/Hero'
import UploadPanel from './components/UploadPanel'
import Results from './components/Results'

function App() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState(null)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Hero onUploadClick={() => setOpen(true)} />
      <Results result={result} />
      <UploadPanel open={open} onClose={() => setOpen(false)} onAnalyzed={setResult} />

      <footer className="mt-auto py-8 text-center text-sm text-gray-500">
        Regulation keeps the world safer. It can be annoying — we make it seamless.
      </footer>
    </div>
  )
}

export default App
