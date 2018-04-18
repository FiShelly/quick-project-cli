const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    devtool: 'source-map',

    entry: [
        path.join(__dirname, 'src/main.js')
    ],

    output: {
        path: path.resolve(__dirname, './dist'),
        filename: `js/[name].js`,
        publicPath: './',
        libraryTarget: 'umd'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: ['babel-loader'],
                exclude: [path.resolve('./node_modules')],
                options: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react'],
                    plugins: [
                        ["transform-object-rest-spread"],
                        ["transform-runtime"]
                    ]
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.(less|css)$/,
                use: ['style-loader', 'css-loader?sourceMap', 'less-loader?sourceMap']
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'file-loader',
                options: {
                    limit: 10000,
                    name: 'image/[name].[ext]?[hash]'
                }
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            title: 'My App',
            filename: 'index.html',
            template: './static/html/index.html',
            inject: true,
        })
    ]
};

