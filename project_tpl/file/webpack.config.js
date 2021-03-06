const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

    devtool: 'inline-source-map',

    entry: [
        'webpack-hot-middleware/client',
        'webpack/hot/only-dev-server',
        path.join(__dirname, 'src/main.js')
    ],

    output: {
        path: __dirname + '/__build__',
        publicPath: '/__build__/',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.json', '.sass', '.scss', '.less', 'jsx', '.vue'],
        alias: {
            ${aliasVueConfig}
            'assets': path.resolve(__dirname, './src/assets'),
            'components': path.resolve(__dirname, './src/components'),
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/, //用babel编译jsx和es6
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react'],
                    plugins: [
                        ["transform-object-rest-spread"],
                        ["transform-runtime"]
                    ]
                }
            },
${jsConfig}
${cssConfig}
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'file-loader',
                options: {
                    limit: 10000,
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"dev"'
            }
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
