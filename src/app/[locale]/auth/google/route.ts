// src/app/api/v1/auth/google/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI  // Thêm redirect URI
);

const scopes = [
    'openid',
    'profile',
    'email',
];

export async function GET(request: Request) {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Lấy refresh token
        scope: scopes,
        prompt: 'consent', // Luôn hiển thị consent screen (cho lần đầu)
    });

    return NextResponse.redirect(url);
}