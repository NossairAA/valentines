"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useSounds } from "./use-sounds"

const FLEE_RADIUS = 130

export function RunawayButton({
  onClickAnyway,
}: { onClickAnyway: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [escapeCount, setEscapeCount] = useState(0)
  const [caught, setCaught] = useState(false)
  const cooldownRef = useRef(false)
  const { playClick, playCheer } = useSounds()
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [vanished, setVanished] = useState(false)

  const messages = [
    "No",
    "Are you sure?",
    "Really sure?",
    "Think again!",
    "Pls no...",
    "Don't do this!",
    "I'm running!",
    "You can't catch me!",
    "Nice try!",
    "Nope!",
    "Not happening!",
  ]

  const flee = useCallback(
    (clientX: number, clientY: number) => {
      if (caught || cooldownRef.current) return
      if (!buttonRef.current) return

      const btn = buttonRef.current
      const parent = btn.parentElement
      if (!parent) return

      const btnRect = btn.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()

      const btnCenterX = btnRect.left + btnRect.width / 2
      const btnCenterY = btnRect.top + btnRect.height / 2
      let dx = btnCenterX - clientX
      let dy = btnCenterY - clientY

      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      if (dist > FLEE_RADIUS) return

      // Throttle: skip if we just fled
      cooldownRef.current = true
      setTimeout(() => {
        cooldownRef.current = false
      }, 400)

      dx /= dist
      dy /= dist

      // Flee faster when cursor is closer
      const urgency = 1 - dist / FLEE_RADIUS
      const fleeDist = 100 + urgency * 140 + Math.random() * 60
      const jitter = (Math.random() - 0.5) * 0.8
      const fleeX = dx * fleeDist + jitter * dy * fleeDist * 0.4
      const fleeY = dy * fleeDist - jitter * dx * fleeDist * 0.4

      const maxX = (parentRect.width - btnRect.width) / 2
      const maxY = (parentRect.height - btnRect.height) / 2
      const cur = positionRef.current
      const newX = Math.max(-maxX, Math.min(maxX, cur.x + fleeX))
      const newY = Math.max(-maxY, Math.min(maxY, cur.y + fleeY))

      const spin = (Math.random() - 0.5) * 30

      // occasionally teleport instead of normal flee
      const teleport = Math.random() < 0.08
      const finalX = teleport ? (Math.random() * 2 - 1) * maxX : newX
      const finalY = teleport ? (Math.random() * 2 - 1) * maxY : newY

      positionRef.current = { x: finalX, y: finalY }
      setPosition({ x: finalX, y: finalY })
      setRotation(spin)
      setEscapeCount((prev) => prev + 1)

      // increase speed multiplier gradually so it runs faster
      setSpeedMultiplier((s) => Math.min(2.5, s + 0.07))

      // playful squeak sound when fleeing
      try {
        playClick()
      } catch (e) {}

      setTimeout(() => setRotation(0), 350)
    },
      [caught],
  )

  // Track pointer movement for proximity detection.
  // Use pointer events and ignore touch pointers to avoid duplicated events on mobile.
  useEffect(() => {
    if (caught) return

    const handlePointerMove = (e: PointerEvent) => {
      // Ignore touch pointers (we handle touchstart separately)
      if (e.pointerType === "touch") return
      flee(e.clientX, e.clientY)
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [flee, caught])

  const handleClick = useCallback((e?: React.MouseEvent) => {
    // If already caught, accept
    if (caught) {
      setTimeout(() => onClickAnyway(), 150)
      return
    }

    // Otherwise, clicking should make it run away: use click coords if available
    // Clicking causes the button to vanish and notify the parent to animate the Yes button.
    setVanished(true)
    // small delay so vanish animation is visible
    setTimeout(() => onClickAnyway(), 360)
  }, [caught, flee, onClickAnyway])

  return (
    <motion.button
      ref={buttonRef}
      onTouchStart={(e) => {
        const t = e.touches[0]
        // on touch, make a single flee and don't repeatedly trigger via pointer events
        flee(t.clientX, t.clientY)
        // small vibration if supported
        try { navigator.vibrate?.(20) } catch (e) {}
      }}
      onClick={handleClick}
      className={`rounded-full px-8 py-3 text-lg font-bold cursor-pointer select-none whitespace-nowrap ${
        caught
          ? "bg-primary text-primary-foreground shadow-lg"
          : "border-2 border-primary/30 bg-card text-foreground"
      }`}
      // Animate position/rotation/scale via Framer Motion to avoid conflicting inline transforms
      animate={{ x: position.x, y: position.y, rotate: rotation, scale: vanished ? 0.6 : (caught ? 1.15 : 1), opacity: vanished ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 420 * speedMultiplier, damping: 28 }}
      whileTap={{ scale: 0.96 }}
      aria-label="No button that runs away"
    >
      {caught ? "Yes!" : messages[Math.min(escapeCount, messages.length - 1)]}
    </motion.button>
  )
}
