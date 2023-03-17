const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
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