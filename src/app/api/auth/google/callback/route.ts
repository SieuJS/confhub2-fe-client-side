// src/app/api/v1/auth/google/callback/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { headers } from 'next/headers'; // Import headers

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    console.log("Có callback");

    if (!code) {
      return NextResponse.json({ message: 'Missing authorization code' }, { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: 'v1', auth: oauth2Client });
    const me = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });

    const email = me.data.emailAddresses?.[0]?.value;
    const name = me.data.names?.[0]?.displayName;
    const photoUrl = me.data.photos?.[0]?.url;

    if (!email || !name) {
      return NextResponse.json({ message: 'Could not retrieve user information' }, { status: 500 });
    }

    // Call the backend API to create/update the user
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, photoUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from backend:", errorData);
      return NextResponse.json({ message: errorData.message || "Backend error" }, { status: response.status });
    }

    const data = await response.json();
    const { password, ...userWithoutPassword } = data.user;

    // Set cookies (this is correct)
    cookies().set('user', JSON.stringify(userWithoutPassword));
    cookies().set('loginStatus', 'true');

    // Get the referer header to determine the original URL
    const referer = headers().get('referer');
    let localePrefix = '';
    if (referer) {
        const refererUrl = new URL(referer);
         // Extract the locale from the referer URL
        localePrefix = refererUrl.pathname.split('/')[1];
    }

    const pathWithLocale = `/${localePrefix}`;
    console.log("[Server - /api/v1/auth/google/callback] Redirecting to:",  new URL(pathWithLocale, process.env.BASE_URL)); // Log 7

    return NextResponse.redirect(new URL(pathWithLocale, process.env.BASE_URL));

  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
}