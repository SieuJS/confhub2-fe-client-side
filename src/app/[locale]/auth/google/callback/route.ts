// src/app/api/v1/auth/google/callback/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ message: 'Missing authorization code' }, { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);


    const people = google.people({ version: 'v1', auth: oauth2Client });
    const me = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names',
    });

    const email = me.data.emailAddresses?.[0]?.value;
    const name = me.data.names?.[0]?.displayName;

    if (!email || !name) {
      return NextResponse.json({ message: 'Could not retrieve user information' }, { status: 500 });
    }
    // Tạo hoặc tìm user trong database của bạn dựa vào email
    // Ví dụ (giả định bạn có hàm createUserOrFind):
    // const user = await createUserOrFind(email, name);

    // Lưu thông tin user vào session (ví dụ, sử dụng cookies)
    cookies().set('user', JSON.stringify({ email, name })); // Lưu ý: Chỉ lưu những thông tin cần thiết
    cookies().set('loginStatus', 'true');

    // Chuyển hướng về trang chủ
    return NextResponse.redirect(process.env.BASE_URL || 'http://localhost:3000');

  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
}