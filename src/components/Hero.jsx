import React, { useEffect, useRef } from 'react'
import Spline from '@splinetool/react-spline'
import { motion } from 'framer-motion'

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const lerp = (a, b, t) => a + (b - a) * t

const Hero = ({ onUploadClick }) => {
  const splineRef = useRef(null)
  const targetRef = useRef(null)
  const containerRef = useRef(null)

  // Smooth animation state
  const targetAngles = useRef({ pitch: 0, yaw: 0 })
  const currentAngles = useRef({ pitch: 0, yaw: 0 })
  const rafRef = useRef(0)
  const hasPointerMoved = useRef(false)

  const handleLoad = (spline) => {
    splineRef.current = spline
    // Try a few likely node names from the Spline scene
    const candidates = ['Head', 'Robot', 'Avatar', 'Character', 'Face']
    let found = null
    for (const name of candidates) {
      const obj = spline.findObjectByName?.(name)
      if (obj) { found = obj; break }
    }
    targetRef.current = found
  }

  useEffect(() => {
    const maxYaw = 0.6
    const maxPitch = 0.4

    // Compute angles from full viewport for a larger tracking zone
    const computeAngles = (clientX, clientY) => {
      const vw = window.innerWidth || 1
      const vh = window.innerHeight || 1
      const cx = vw / 2
      const cy = vh / 2
      const dx = (clientX - cx) / vw
      const dy = (clientY - cy) / vh
      const yaw = clamp(dx * 2 * maxYaw, -maxYaw, maxYaw)
      const pitch = clamp(-dy * 2 * maxPitch, -maxPitch, maxPitch)
      return { pitch, yaw }
    }

    const onPointerMove = (e) => {
      const { pitch, yaw } = computeAngles(e.clientX, e.clientY)
      targetAngles.current = { pitch, yaw }
      if (!hasPointerMoved.current) {
        // Snap to the first target instantly to remove any perceived delay
        currentAngles.current = { pitch, yaw }
        hasPointerMoved.current = true
      }
    }

    const onPointerLeave = () => {
      targetAngles.current = { pitch: 0, yaw: 0 }
      hasPointerMoved.current = false
    }

    const animate = () => {
      const target = targetRef.current
      if (target) {
        const ease = 0.28 // increase for snappier response (was 0.15)
        currentAngles.current = {
          pitch: lerp(currentAngles.current.pitch, targetAngles.current.pitch, ease),
          yaw: lerp(currentAngles.current.yaw, targetAngles.current.yaw, ease),
        }
        const roll = target.rotation?.z ?? 0
        target.rotation = { x: currentAngles.current.pitch, y: currentAngles.current.yaw, z: roll }
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    // Use pointer events (covers mouse, pen, some touch) and can be coalesced by the browser
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    // Fallbacks for older environments
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    window.addEventListener('mouseleave', onPointerLeave)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseleave', onPointerLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="absolute inset-0">
        <Spline onLoad={handleLoad} scene="https://prod.spline.design/OG17yM2eUIs8MUmA/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-10">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-3 py-1 text-xs font-semibold w-fit">
              <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
              Interactive 3D — move your mouse
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              Compliance, but make it fun
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Drop your docs and get a playful, honest gap analysis. We celebrate how rules keep people safe — and we tame the annoying parts so your team glides through compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onUploadClick} className="inline-flex items-center justify-center rounded-lg bg-lime-400 text-gray-900 font-semibold px-5 py-3 shadow hover:shadow-md hover:bg-lime-300 transition">
                Upload a document
              </button>
              <a href="#how" className="inline-flex items-center justify-center rounded-lg bg-gray-900 text-white font-semibold px-5 py-3 shadow hover:shadow-md transition">
                How it works
              </a>
            </div>
          </motion.div>
        </div>
        <div className="hidden lg:block" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-50 to-transparent" />
    </div>
  )
}

export default Hero
