"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useSounds } from "./use-sounds"

const FLEE_RADIUS = 130
const ESCAPE_MESSAGES = [
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

export function RunawayButton({
  onClickAnyway,
}: { onClickAnyway: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [buttonWidth, setButtonWidth] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [escapeCount, setEscapeCount] = useState(0)
  const [caught, setCaught] = useState(false)
  const cooldownRef = useRef(false)
  const { playClick, playCheer } = useSounds()
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [vanished, setVanished] = useState(false)

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
      const dist = Math.hypot(btnCenterX - clientX, btnCenterY - clientY)
      if (dist > FLEE_RADIUS) return

      // Throttle: skip if we just fled
      cooldownRef.current = true
      setTimeout(() => {
        cooldownRef.current = false
      }, 400)

      const edgePadding = 12
      const nextMessage = ESCAPE_MESSAGES[Math.min(escapeCount + 1, ESCAPE_MESSAGES.length - 1)]
      const buttonStyle = window.getComputedStyle(btn)
      const measureContext = document.createElement("canvas").getContext("2d")
      const horizontalPadding =
        Number.parseFloat(buttonStyle.paddingLeft) +
        Number.parseFloat(buttonStyle.paddingRight) +
        Number.parseFloat(buttonStyle.borderLeftWidth) +
        Number.parseFloat(buttonStyle.borderRightWidth)
      const verticalPadding =
        Number.parseFloat(buttonStyle.paddingTop) +
        Number.parseFloat(buttonStyle.paddingBottom) +
        Number.parseFloat(buttonStyle.borderTopWidth) +
        Number.parseFloat(buttonStyle.borderBottomWidth)
      const precedingButton = btn.previousElementSibling as HTMLElement | null
      const precedingButtonWidth = precedingButton?.offsetWidth ?? 0
      const rowGap = Number.parseFloat(window.getComputedStyle(parent).columnGap) || 0
      let nextButtonWidth = btnRect.width
      let nextButtonHeight = btnRect.height

      if (measureContext) {
        measureContext.font = `${buttonStyle.fontWeight} ${buttonStyle.fontSize} ${buttonStyle.fontFamily}`
        const messageWidth = measureContext.measureText(nextMessage).width
        const availableWidth = Math.max(
          edgePadding * 2,
          parentRect.width - edgePadding * 2 - precedingButtonWidth - rowGap,
        )
        nextButtonWidth = Math.min(
          availableWidth,
          Math.max(btnRect.width, Math.ceil(messageWidth + horizontalPadding)),
        )
        const lineHeight = Number.parseFloat(buttonStyle.lineHeight) || Number.parseFloat(buttonStyle.fontSize) * 1.2
        const lineCount = Math.max(1, Math.ceil(messageWidth / Math.max(1, nextButtonWidth - horizontalPadding)))
        nextButtonHeight = Math.max(btnRect.height, lineCount * lineHeight + verticalPadding)
      }

      setButtonWidth(nextButtonWidth)
      const minCenterX = parentRect.left + edgePadding + nextButtonWidth / 2
      const maxCenterX = Math.max(minCenterX, parentRect.right - edgePadding - nextButtonWidth / 2)
      const minCenterY = parentRect.top + edgePadding + nextButtonHeight / 2
      const maxCenterY = Math.max(minCenterY, parentRect.bottom - edgePadding - nextButtonHeight / 2)
      const currentCenterX = btnRect.left + btnRect.width / 2
      const currentCenterY = btnRect.top + btnRect.height / 2
      const baseCenterX = parentRect.left + btn.offsetLeft + btn.offsetWidth / 2
      const baseCenterY = parentRect.top + btn.offsetTop + btn.offsetHeight / 2
      const availableMovement = Math.hypot(maxCenterX - minCenterX, maxCenterY - minCenterY)
      const minimumMovement = Math.min(72, availableMovement / 3)
      const safeCurrentCenterX = Math.max(minCenterX, Math.min(maxCenterX, currentCenterX))
      const safeCurrentCenterY = Math.max(minCenterY, Math.min(maxCenterY, currentCenterY))
      const possibleTargets = [
        { x: minCenterX, y: minCenterY },
        { x: maxCenterX, y: minCenterY },
        { x: minCenterX, y: maxCenterY },
        { x: maxCenterX, y: maxCenterY },
        { x: minCenterX, y: safeCurrentCenterY },
        { x: maxCenterX, y: safeCurrentCenterY },
        { x: safeCurrentCenterX, y: minCenterY },
        { x: safeCurrentCenterX, y: maxCenterY },
      ].filter(
        (target) => Math.hypot(target.x - currentCenterX, target.y - currentCenterY) >= minimumMovement,
      )
      const targetsFarthestFromPointer = possibleTargets.sort(
        (left, right) =>
          Math.hypot(right.x - clientX, right.y - clientY) -
          Math.hypot(left.x - clientX, left.y - clientY),
      )
      const fallbackTarget = { x: safeCurrentCenterX, y: safeCurrentCenterY }
      const target =
        Math.random() < 0.08 && possibleTargets.length > 1
          ? possibleTargets[Math.floor(Math.random() * possibleTargets.length)]
          : targetsFarthestFromPointer[0] ?? fallbackTarget
      const finalX = target.x - baseCenterX
      const finalY = target.y - baseCenterY

      const spin = (Math.random() - 0.5) * 30

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
      [caught, escapeCount, playClick],
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
      className={`max-w-full rounded-full px-8 py-3 text-lg font-bold cursor-pointer select-none whitespace-normal text-center ${
        caught
          ? "bg-primary text-primary-foreground shadow-lg"
          : "border-2 border-primary/30 bg-card text-foreground"
      }`}
      // Animate position/rotation/scale via Framer Motion to avoid conflicting inline transforms
      animate={{ x: position.x, y: position.y, rotate: rotation, scale: vanished ? 0.6 : (caught ? 1.15 : 1), opacity: vanished ? 0 : 1 }}
      transition={{ type: "tween", duration: 0.32 / speedMultiplier, ease: "easeOut" }}
      whileTap={{ scale: 0.96 }}
      style={{ width: buttonWidth ? `${buttonWidth}px` : undefined }}
      aria-label="No button that runs away"
    >
      {caught ? "Yes!" : ESCAPE_MESSAGES[Math.min(escapeCount, ESCAPE_MESSAGES.length - 1)]}
    </motion.button>
  )
}
