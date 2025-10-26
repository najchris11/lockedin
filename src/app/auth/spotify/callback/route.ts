import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect('/?error=missing_code');
  }

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 
      !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 
      !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('Missing Spotify environment variables');
    return NextResponse.redirect('/?error=spotify_config_missing');
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
    // Log the error for debugging
    const errorText = await response.text();
    console.error('Spotify token exchange failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    
    // Try to parse error details from the response
    let errorDetail = 'spotify_auth_failed';
    try {
      const errorData = JSON.parse(errorText);
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
    // Create a proper HTML page that stores tokens and redirects
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Authentication</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #1db954, #191414);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .spinner {
              border: 3px solid rgba(255,255,255,0.3);
              border-radius: 50%;
              border-top: 3px solid white;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Connecting to Spotify...</h2>
            <p>Please wait while we set up your music integration.</p>
          </div>
          <script>
            try {
              // Store tokens in localStorage
              localStorage.setItem('spotify_access_token', '${data.access_token}');
              localStorage.setItem('spotify_refresh_token', '${data.refresh_token}');
              
              // Redirect to dashboard after a short delay
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1500);
            } catch (error) {
              console.error('Error storing Spotify tokens:', error);
              // Fallback redirect
              window.location.href = '/dashboard?error=token_storage_failed';
            }
          </script>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  return NextResponse.redirect('/?error=spotify_auth_failed');
}