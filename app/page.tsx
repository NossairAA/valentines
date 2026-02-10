import { FloatingHearts } from "@/components/floating-hearts"
import { ValentineCard } from "@/components/valentine-card"

export default function Page() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <FloatingHearts />
      <ValentineCard />
    </main>
  )
}
