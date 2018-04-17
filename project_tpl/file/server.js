var path = require('path');
var express = require('express');
var webpack = require('webpack');
var proxy = require('http-proxy-middleware');
var config = require('./webpack.config.js');

var app = express();
var compiler = webpack(config);

const options = {

    target: 'http://cms.cmsdev',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    }

};
app.use(require('connect-history-api-fallback')())

app.use(proxy(['/api'],options));

app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    contentBase: './dist',
    hot: true,
    lazy: false,
    host: 'localhost'
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use(express.static(__dirname));

app.listen(3000, function () {
    console.log('Server listening on http://localhost:3000, Ctrl+C to stop');
});
