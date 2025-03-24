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
    console.log("[Server - /api/v1/auth/google] Generating Google Auth URL"); // Log 2

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
    });

    console.log("[Server - /api/v1/auth/google] Redirecting to Google:", url); // Log 3
    return NextResponse.redirect(url);
}