module.exports = {
    apps: [
        {
            name: 'validateur-forge',
            script: '.output/server/index.mjs',
            env: {
                HOST: '0.0.0.0',
                PORT: 3000,
                NODE_TLS_REJECT_UNAUTHORIZED: '0',
            },
            instances: 1,
            autorestart: true,
            max_memory_restart: '512M',
        },
    ],
}
