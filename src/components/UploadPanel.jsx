import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const UploadPanel = ({ open, onClose, onAnalyzed }) => {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const onDrop = async (files) => {
    if (!files || files.length === 0) return
    const file = files[0]
    await handleUpload(file)
  }

  const handleUpload = async (file) => {
    setError('')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('doc_title', file.name)

      const res = await fetch(`${backend}/api/analyze`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const data = await res.json()
      onAnalyzed?.(data)
      onClose?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative mx-auto mt-20 w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Drop a document</h3>
            <p className="text-sm text-gray-600 mb-6">We scan for common control themes and show you the gaps. PDFs, DOCX, and TXT welcome.</p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); onDrop(e.dataTransfer.files) }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${dragging ? 'border-lime-400 bg-lime-50' : 'border-gray-200'}`}
            >
              <input ref={inputRef} type="file" className="hidden" onChange={(e) => onDrop(e.target.files)} />
              <div className="space-y-2">
                <p className="text-gray-800 font-medium">Drag & drop here</p>
                <p className="text-sm text-gray-500">or</p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 text-white font-semibold px-4 py-2"
                  disabled={loading}
                >
                  {loading ? 'Uploading…' : 'Choose file'}
                </button>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <button onClick={onClose} className="mt-6 text-sm text-gray-600 hover:text-gray-900">Close</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UploadPanel
