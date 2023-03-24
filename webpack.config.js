const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: {
        app: './src/index.js',
    },
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Hot Module Replacement',
        }),
    ],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.(csv|tsv)$/i,
                use: ['csv-loader'],
            },
        ],
    },
    experiments: {
        topLevelAwait: true,
    },
    optimization: {
        minimize: false,
    },
};