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

    // --- BẮT ĐẦU PHẦN THÊM VÀO ĐỂ XỬ LÝ SVG ---
  webpack(config) {
    // Lấy rule mặc định cho SVG để ghi đè nó
    const fileLoaderRule = config.module.rules.find(rule =>
      rule.test?.test?.('.svg')
    )

    config.module.rules.push(
      // Cấu hình lại rule mặc định để loại trừ file SVG được import từ file .js/.ts
      // để chúng ta có thể xử lý chúng bằng @svgr/webpack
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/ // chỉ xử lý các file svg có ?url ở cuối
      },
      // Thêm rule mới để xử lý SVG như là React Component
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // loại trừ các file có ?url
        use: ['@svgr/webpack']
      }
    )

    // Sửa đổi fileLoaderRule để nó không xử lý các file SVG mà svgr sẽ xử lý
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },

  // Remove experimental esmExternals to avoid module loading issues
  // --- KẾT THÚC PHẦN THÊM VÀO ---
}

module.exports = withPWA(withNextIntl(nextConfig))
