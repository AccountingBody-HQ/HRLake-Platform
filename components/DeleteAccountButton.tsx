"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export default function DeleteAccountButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "loading" | "done" | "error">("idle")
  const router = useRouter()

  async function handleDelete() {
    setStep("loading")
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" })
      if (res.ok) {
        setStep("done")
        setTimeout(() => router.push("/"), 1500)
      } else {
        setStep("error")
      }
    } catch {
      setStep("error")
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-7 py-5 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">Account Settings</h2>
      </div>
      <div className="px-7 py-6">
        <p className="text-sm text-slate-600 mb-4">
          Deleting your account will permanently remove all your data including saved calculations and account information. This cannot be undone.
        </p>
        {step === "idle" && (
          <button
            onClick={() => setStep("confirm")}
            className="inline-flex items-center gap-2 text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Trash2 size={15} /> Delete my account
          </button>
        )}
        {step === "confirm" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-800 mb-3">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
                Yes, delete my account
              </button>
              <button onClick={() => setStep("idle")} className="border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
        {step === "loading" && <p className="text-sm text-slate-500">Deleting your account...</p>}
        {step === "done" && <p className="text-sm text-green-600 font-semibold">Account deleted. Redirecting...</p>}
        {step === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again or contact support.</p>}
      </div>
    </div>
  )
}
