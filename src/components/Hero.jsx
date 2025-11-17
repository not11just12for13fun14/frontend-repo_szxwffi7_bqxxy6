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
  const isActive = useRef(false) // track active drag for touch/pen

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

    const updateAngles = (x, y, instant = false) => {
      const { pitch, yaw } = computeAngles(x, y)
      targetAngles.current = { pitch, yaw }
      if (instant || !hasPointerMoved.current) {
        currentAngles.current = { pitch, yaw }
        hasPointerMoved.current = true
      }
    }

    const onPointerDown = (e) => {
      isActive.current = true
      updateAngles(e.clientX, e.clientY, true)
    }

    const onPointerMove = (e) => {
      // For mouse, always track; for touch/pen, track only when active to avoid scroll conflicts
      if (e.pointerType === 'mouse' || isActive.current) {
        updateAngles(e.clientX, e.clientY)
      }
    }

    const resetToNeutral = () => {
      targetAngles.current = { pitch: 0, yaw: 0 }
      hasPointerMoved.current = false
    }

    const onPointerUp = () => {
      isActive.current = false
      resetToNeutral()
    }

    const onPointerCancel = () => {
      isActive.current = false
      resetToNeutral()
    }

    const onPointerLeave = () => {
      // If mouse leaves viewport, smoothly return to neutral
      if (!isActive.current) resetToNeutral()
    }

    const animate = () => {
      const target = targetRef.current
      if (target) {
        const ease = 0.4 // snappier response (previously 0.28)
        currentAngles.current = {
          pitch: lerp(currentAngles.current.pitch, targetAngles.current.pitch, ease),
          yaw: lerp(currentAngles.current.yaw, targetAngles.current.yaw, ease),
        }
        const roll = target.rotation?.z ?? 0
        target.rotation = { x: currentAngles.current.pitch, y: currentAngles.current.yaw, z: roll }
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    // Pointer events cover mouse, touch, pen
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('pointerleave', onPointerLeave)

    // Fallbacks for older environments
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    window.addEventListener('mouseleave', onPointerLeave)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseleave', onPointerLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-b from-white to-gray-50 touch-none">
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
              Interactive 3D — move your mouse or drag
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
