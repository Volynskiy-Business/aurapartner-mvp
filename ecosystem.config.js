module.exports = {
  apps: [
    {
      name: 'aura-backend',
      script: './backend/dist/index.js',
      cwd: '/opt/aurapartnerai',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true
    },
    {
      name: 'aura-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/opt/aurapartnerai/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true
    }
  ]
};
