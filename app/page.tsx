"use client"

import { useState } from "react"
import { FloatingHearts } from "@/components/floating-hearts"
import { ValentineCard } from "@/components/valentine-card"
import { PasswordGate } from "@/components/password-gate"

export default function Page() {
  const [isUnlocked, setIsUnlocked] = useState(false)

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <FloatingHearts />
      <ValentineCard />
    </main>
  )
}
