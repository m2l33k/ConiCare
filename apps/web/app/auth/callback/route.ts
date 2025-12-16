import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // We ignore 'next' here because we want to redirect based on the user's role in the DB
  // But we can keep it as a fallback if needed.

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Fetch user profile to determine role
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role) {
          return NextResponse.redirect(`${origin}/dashboard/${profile.role}`)
        }
      }
      
      // Fallback if no profile found (shouldn't happen with trigger)
      return NextResponse.redirect(`${origin}/dashboard/parent`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
