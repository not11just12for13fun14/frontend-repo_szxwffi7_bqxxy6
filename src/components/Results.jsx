import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Pill = ({ label, value }) => (
  <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
    <span className="font-medium text-gray-700">{label}</span>
    <span className="text-gray-500">{Math.round(value * 100)}%</span>
  </div>
)

const Results = ({ result }) => {
  if (!result) return null
  const score = Math.round(result.coverage_score * 100)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="mx-auto w-[92vw] max-w-4xl rounded-2xl bg-white p-6 shadow-xl -mt-12 relative z-20"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Gap Analysis</h3>
              <p className="text-sm text-gray-500">{result.filename} • {result.mime_type} • {(result.size/1024).toFixed(1)} KB</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold text-gray-900">{score}</div>
              <div className="text-xs text-gray-500">Coverage</div>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{result.summary}</p>

          <div className="flex flex-wrap gap-2">
            {Object.entries(result.keyword_coverage).map(([k, v]) => (
              <Pill key={k} label={k} value={v} />
            ))}
          </div>

          {result.gaps?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Gaps</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.gaps.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.recommendations.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Results
