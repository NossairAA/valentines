"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { RunawayButton } from "./runaway-button"
import { Celebration } from "./celebration"
import { useSounds } from "./use-sounds"

export function ValentineCard() {
  const [accepted, setAccepted] = useState(false)
  const { playCheer } = useSounds()
  const [yesEmph, setYesEmph] = useState(false)

  const handleAccept = () => {
    try {
      playCheer()
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
    } catch (e) {}
    setAccepted(true)
  }

  const handleRunawayClick = () => {
    // show enlarged centered Yes button and wait for user to click it
    setYesEmph(true)
  }

  if (accepted) {
    return (
      <>
        <Celebration />
        <motion.div
          className="relative z-10 flex flex-col items-center gap-6"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl">
            <Image
              src="/ChatGPT Image 11 févr. 2026, 14_00_38.png"
              alt="Cute bear holding a heart"
              fill
              priority
              className="object-cover"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-primary text-center text-balance leading-tight">
            Yay!!!
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 text-center text-pretty max-w-md">
            I knew you&apos;d say yes! You just made me the happiest person ever!
          </p>

          <div className="flex gap-2 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-primary animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>

          <style jsx>{`
            @keyframes bounce-in {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.1); }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          `}</style>
        </motion.div>
      </>
    )
  }

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl animate-gentle-bounce">
        <Image
          src="/ChatGPT Image 11 févr. 2026, 14_00_38.png"
          alt="Cute bear holding a heart"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl md:text-5xl font-bold text-primary text-center text-balance leading-tight">
          Would you be my Valentine?
        </h1>
        <p className="text-base md:text-lg text-foreground/60 text-center">Choose wisely...</p>
      </div>

      <div className="relative flex items-center justify-center gap-6 w-full min-h-[120px]">
        <motion.button
          onClick={handleAccept}
          className={`rounded-full px-8 py-3 text-lg font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 cursor-pointer z-10 ${
            yesEmph ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          Yes!
        </motion.button>
        <RunawayButton onClickAnyway={handleRunawayClick} />

        {yesEmph && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.35, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="rounded-full px-10 py-4 text-2xl font-extrabold bg-primary text-primary-foreground shadow-2xl"
              onClick={handleAccept}
            >
              Yes!
            </motion.button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-gentle-bounce { animation: gentle-bounce 2s ease-in-out infinite; }
      `}</style>
    </motion.div>
  )
}
