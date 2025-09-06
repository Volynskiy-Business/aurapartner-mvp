module.exports = {
  apps: [
    {
      name: "aura-frontend",
      cwd: "/opt/aurapartnerai/frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1"
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "500M",
      watch: false,
      autorestart: true,
      time: true,
      merge_logs: true,
      out_file: "/opt/aurapartnerai/frontend/logs/out.log",
      error_file: "/opt/aurapartnerai/frontend/logs/error.log"
    }
  ]
};
