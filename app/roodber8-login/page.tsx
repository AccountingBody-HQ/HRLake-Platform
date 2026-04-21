'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/roodber8')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="flex items-center justify-center" style={{ minHeight: "70vh", paddingTop: "60px", paddingBottom: "60px", background: "#080d1a" }}>
      <div className="rounded-2xl p-8 w-full max-w-sm" style={{ background: "#0d1424", border: "1px solid #1a2238" }}>
        <h1 className="text-white font-bold text-xl mb-6">Admin Access</h1>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Enter admin password"
          className="w-full px-4 py-3 text-white rounded-xl outline-none mb-3" style={{ background: "#111827", border: "1px solid #1f2937" }}
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Enter Admin
        </button>
      </div>
    </div>
  )
}
