const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/api/crawl-conferences', // Bất kỳ request nào đến /api/...
            destination: 'http://172.188.242.233:3000/crawl-conferences', // ...sẽ được chuyển tiếp đến đây
          },
          {
            source: '/api/crawl-journals', // Bất kỳ request nào đến /api/...
            destination: 'http://172.188.242.233:3000/crawl-journals', // ...sẽ được chuyển tiếp đến đây
          },
        ];
    } 
}

module.exports = withNextIntl(nextConfig)
