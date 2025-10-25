import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect('/?error=missing_code');
  }

  const tokenUrl = 'https://accounts.spotify.com/api/token';

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  let data: any;
  if (!response.ok) {
    // Try to parse error details from the response
    let errorDetail = 'spotify_auth_failed';
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorDetail = encodeURIComponent(errorData.error_description || errorData.error);
      }
    } catch (e) {
      // Ignore JSON parse errors, use default error
    }
    return NextResponse.redirect(`/?error=${errorDetail}`);
  }

  data = await response.json();
  if (data.access_token) {
    // Store token in cookies or redirect back to dashboard
    const res = NextResponse.redirect('/dashboard');
    res.cookies.set('spotify_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      path: '/',
    });
    res.cookies.set('spotify_refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return res;
  }

  return NextResponse.redirect('/?error=spotify_auth_failed');
}