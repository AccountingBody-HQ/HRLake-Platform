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
      router.push('/admin/data-quality')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-white font-bold text-xl mb-6">Admin Access</h1>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Enter admin password"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-blue-500 mb-3"
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
