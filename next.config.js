const createNextIntlPlugin = require('next-intl/plugin')
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
})

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'lh3.googleusercontent.com'],
    },
    async rewrites() {
        return [
            {
                source: '/apis/auth/google-callback',
                destination: '/apis/auth/google-callback',
            },
        ]
    },
}

module.exports = withPWA(withNextIntl(nextConfig))
