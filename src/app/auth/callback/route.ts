import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const proto = request.headers.get('x-forwarded-proto')
      const host =
        forwardedHost || request.headers.get('host') || 'localhost:3000'
      const redirectUrl = `${proto || 'https'}://${host}${next}`
      return NextResponse.redirect(redirectUrl)
    }
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto')
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000'
  const redirectUrl = `${proto || 'https'}://${host}/auth/login?error=Unable to authenticate`
  return NextResponse.redirect(redirectUrl)
}
