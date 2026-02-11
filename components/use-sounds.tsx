"use client"

import { useCallback, useRef } from "react"

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null)

  const ensureCtx = () => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (e) {
        ctxRef.current = null
      }
    }
    return ctxRef.current
  }

  const playTone = useCallback((freq = 440, duration = 0.1, gain = 0.05) => {
    const ctx = ensureCtx()
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = "sine"
    o.frequency.value = freq
    g.gain.value = gain
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    setTimeout(() => {
      try {
        o.stop()
        o.disconnect()
        g.disconnect()
      } catch (e) {}
    }, duration * 1000 + 50)
  }, [])

  const tryPlayAudioFile = useCallback((path: string) => {
    try {
      const a = new Audio(path)
      a.play().catch(() => {})
    } catch (e) {}
  }, [])

  const playClick = useCallback(() => {
    // prefer short file if present, fall back to tone
    tryPlayAudioFile("/sounds/click.mp3")
    playTone(880, 0.05, 0.03)
  }, [playTone, tryPlayAudioFile])

  const playCheer = useCallback(() => {
    tryPlayAudioFile("/sounds/cheer.mp3")
    // quick melodic burst
    playTone(660, 0.12, 0.06)
    setTimeout(() => playTone(880, 0.12, 0.05), 120)
    setTimeout(() => playTone(990, 0.14, 0.05), 260)
  }, [playTone, tryPlayAudioFile])

  return { playClick, playCheer }
}
