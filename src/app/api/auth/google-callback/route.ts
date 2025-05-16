import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect('/login?error=No token provided');
    }

    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Return HTML with script to set localStorage
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            localStorage.setItem('token', '${token}');
            localStorage.setItem('locale', 'en');
            localStorage.setItem('loginStatus', 'true');
            window.location.href = '/en/dashboard';
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error in backend callback:', error);
    return NextResponse.redirect('/login?error=Authentication failed');
  }
}
