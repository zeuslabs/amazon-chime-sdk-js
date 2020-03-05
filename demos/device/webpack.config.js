require('dotenv').config({ path: '../.env' })
const path = require('path');

module.exports = env => {
    return {
        entry: [`./src/index.js`],
        output: {
            path: path.join(__dirname, 'public'),
            filename: 'bundle.js'
        },
        module: {
            rules: [{
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(svg)$/,
                    loader: 'raw-loader',
                }
            ]
        },
        devServer: {
            historyApiFallback: true,
            proxy: {
                '/api': {
                    target: `http://localhost:8080`,
                    pathRewrite: { '^/api': '' }
                },

            },
            contentBase: path.join(__dirname, 'public'),
            compress: true,
            hot: true,
            host: '0.0.0.0',
            disableHostCheck: true,
            port: 3000,
        },
        devtool: 'cheap-module-eval-source-map'
    }
};