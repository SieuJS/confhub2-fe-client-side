import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG

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
              window.location.href = 'localStorage.getItem('returnUrl')';
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
            localStorage.setItem('token', '${token}');
            localStorage.setItem('loginStatus', 'true');
            window.location.href = localStorage.getItem('returnUrl');
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
