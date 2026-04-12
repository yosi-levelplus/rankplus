import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  if (!user && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/auth/login', request.url)
    return Response.redirect(loginUrl)
  }

  if (user && pathname.startsWith('/auth/login')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return Response.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
}
