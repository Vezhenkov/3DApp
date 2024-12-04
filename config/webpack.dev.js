const { merge } = require('webpack-merge');
const common = require('./webpack.common');
require('css-loader')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: ['assets', 'source'],
        open: true,
        compress: true,
        hot: true,
        client: {
            overlay: false,
        }
    },
    module: {
        rules: [
            {
                test: /\.(sass|scss|css)$/,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1, modules: false } },
                ],
            },
        ],
    },
})
