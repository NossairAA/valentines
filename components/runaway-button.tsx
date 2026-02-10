"use client"

import { useCallback, useEffect, useRef, useState } from "react"

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

      positionRef.current = { x: newX, y: newY }
      setPosition({ x: newX, y: newY })
      setRotation(spin)
      setEscapeCount((prev) => prev + 1)

      setTimeout(() => setRotation(0), 350)
    },
    [caught],
  )

  // Track mouse movement on the whole document for proximity detection
  useEffect(() => {
    if (caught) return

    const handleMouseMove = (e: MouseEvent) => {
      flee(e.clientX, e.clientY)
    }

    document.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [flee, caught])

  const handleClick = useCallback(() => {
    if (caught) return
    setCaught(true)
    positionRef.current = { x: 0, y: 0 }
    setPosition({ x: 0, y: 0 })
    setRotation(0)
    setTimeout(() => {
      onClickAnyway()
    }, 900)
  }, [caught, onClickAnyway])

  return (
    <button
      ref={buttonRef}
      onTouchStart={(e) => {
        const t = e.touches[0]
        flee(t.clientX, t.clientY)
      }}
      onClick={handleClick}
      className={`rounded-full px-8 py-3 text-lg font-bold cursor-pointer select-none whitespace-nowrap ${
        caught
          ? "bg-primary text-primary-foreground shadow-lg"
          : "border-2 border-primary/30 bg-card text-foreground"
      }`}
      style={{
        transform: caught
          ? "translate(0, 0) rotate(0deg) scale(1.15)"
          : `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transition: caught
          ? "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "transform 0.35s cubic-bezier(0.22, 1.2, 0.36, 1), background-color 0.2s ease",
      }}
      aria-label="No button that runs away"
    >
      {caught ? "Yes!" : messages[Math.min(escapeCount, messages.length - 1)]}
    </button>
  )
}
