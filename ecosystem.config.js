// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'fe-frontend',
      script: 'node_modules/next/dist/bin/next',
      // Bind to 0.0.0.0 so the app is reachable from the host/VPN
      args: 'start -p 8386 -H 0.0.0.0', // Quan trọng: Chỉ định port và hostname
      instances: '1', // Sử dụng 1 instance để tránh xung đột cổng
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
      },
    },
  ],
};