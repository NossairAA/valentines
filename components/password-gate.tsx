"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

interface PasswordGateProps {
  onUnlock: () => void
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "240223") {
      setError(false)
      onUnlock()
    } else {
      setError(true)
      setPassword("")
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Heart className="w-16 h-16 text-primary fill-primary" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-primary mb-2">
            Special Access
          </h1>
          <p className="text-center text-foreground/60 mb-8">
            Enter the password to reveal something special
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError(false)
                }}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">
                  Incorrect password. Try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
