const paths = require('./paths')

module.exports = {
    entry: {
        main: [paths.source + '/js/main.js'],
    },
    output: {
        path: paths.build,
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(ico|gif|png|jpg|jpeg)$/i,
                type: 'asset',
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/i,
                type: 'asset',
            },
        ]
    },
}
