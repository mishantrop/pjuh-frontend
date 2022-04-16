export const getConfig = ({ isDev }) => ({
    api: {
        host: isDev ? 'http://localhost:3000' : 'https://api.updatepackagejson.ru',
        endpoints: {
            TEXT_SUBMIT: '/analyze/updates/text',
            FILE_SUBMIT: '/analyze/updates/file',
        },
    },
})
