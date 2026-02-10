"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  angle: number
  velocity: number
}

export function Celebration() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const colors = ["#f472b6", "#fb923c", "#f87171", "#fbbf24", "#a78bfa", "#f9a8d4"]
    const generated: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 10,
      y: 50 + (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 4,
      angle: Math.random() * 360,
      velocity: Math.random() * 200 + 100,
    }))
    setParticles(generated)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const endX = Math.cos(rad) * p.velocity
        const endY = Math.sin(rad) * p.velocity
        return (
          <div
            key={p.id}
            className="absolute rounded-full animate-confetti"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              ["--end-x" as string]: `${endX}px`,
              ["--end-y" as string]: `${endY}px`,
            }}
          />
        )
      })}

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  )
}
