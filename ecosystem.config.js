// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'fe-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 8386', // Quan trọng: Chỉ định port ở đây nếu cần
      instances: '2',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};