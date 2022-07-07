module.exports = {
    load: {
        before: ['cors']
    },
    settings: {
        cors: {
            enabled: true,
            headers: ['*'],
            origin: ['*']
        }
    }
}
