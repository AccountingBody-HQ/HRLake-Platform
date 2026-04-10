import { NextResponse } from 'next/server'
import { timingSafeEqual, createHash } from 'crypto'

const ADMIN_SECRET = process.env.ADMIN_SECRET
if (!ADMIN_SECRET) throw new Error('ADMIN_SECRET env var is not set')

function passwordValid(input: string): boolean {
  try {
    const a = createHash('sha256').update(input).digest()
    const b = createHash('sha256').update(ADMIN_SECRET!).digest()
    return timingSafeEqual(a, b)
  } catch { return false }
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (typeof password !== 'string' || !password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (passwordValid(password)) {
      const res = NextResponse.json({ ok: true })
      res.cookies.set('admin_token', ADMIN_SECRET!, {
        httpOnly: true,
        secure:   true,
        maxAge:   60 * 60 * 24 * 7,
        path:     '/',
      })
      return res
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
