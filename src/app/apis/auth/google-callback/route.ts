//apis/auth/google-callback
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      return new NextResponse(
        `
        <html>
          <body>
            <script>
              const returnUrl = localStorage.getItem('returnUrl') || '/';
              window.location.href = returnUrl;
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
    }

    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Return HTML with script to set localStorage and redirect to the specified URL
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            try {
              localStorage.setItem('token', '${token}');
              localStorage.setItem('loginStatus', 'true');
              const returnUrl = localStorage.getItem('returnUrl') || '/';
              window.location.href = returnUrl;
            } catch (e) {
              // console.error('Error setting localStorage:', e);
              window.location.href = '/';
            }
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
    // console.error('Error in backend callback:', error);
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.location.href = '/';
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
  }
}
