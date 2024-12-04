const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;
const common = require('./webpack.common');
const paths = require('./paths');

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    module: {
        rules: [
        {
            test: /\.(sass|scss|css)$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
                template: paths.source + '/index.html',
            }
        ),
        new HtmlInlineScriptPlugin(),
        new HTMLInlineCSSWebpackPlugin(),
    ],
    optimization: {
        minimizer: [new TerserPlugin({
            terserOptions: {
                keep_classnames: true,
            }
        }), new CssMinimizerPlugin(), '...'],
    },
})