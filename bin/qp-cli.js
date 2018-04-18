#!/usr/bin/env node

const program = require('commander');
const mkdirp = require('mkdirp');
const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sortedObject = require('sorted-object');
const _exit = process.exit;
const cliPkg = require('../package.json');

const version = cliPkg.version;

process.exit = exit;

before(program, 'outputHelp', function () {
    this.allowUnknownOption();
});

program
    .version(version)
    .usage('[options] [dir]')
    .option('--vue', 'add vue.js support')
    .option('--react', 'add react support')
    .option('--less', 'add less support(default)')
    .option('--sass', 'add less support(default is less)')
    .option('--git', 'add .gitignore')
    .parse(process.argv);

if (!exit.exited) {
    main();
}

/**
 * Graceful exit for async STDIO
 */

function exit (code) {
    // flush output for Node.js Windows pipe bug
    // https://github.com/joyent/node/issues/6247 is just one bug example
    // https://github.com/visionmedia/mocha/issues/333 has a good discussion
    function done () {
        if (!(draining--)) _exit(code);
    }

    let draining = 0;
    const streams = [process.stdout, process.stderr];

    exit.exited = true;

    streams.forEach(function (stream) {
        // submit empty write request and wait for completion
        draining += 1;
        stream.write('', done);
    });

    done();
}

/**
 * Install a before function; AOP.
 */

function before (obj, method, fn) {
    var old = obj[method];

    obj[method] = function () {
        fn.call(this);
        old.apply(this, arguments);
    };
}

/**
 * Load template file.
 */
function loadTemplate (name) {
    return fs.readFileSync(path.join(__dirname, '..', 'project_tpl', name), 'utf-8');
}

/**
 * Copy template file.
 */
function copy_template (from, to) {
    from = path.join(__dirname, '..', 'project_tpl', from);
    write(to, fs.readFileSync(from, 'utf-8'));
}

/**
 * Determine if launched from cmd.exe
 */
function launchedFromCmd () {
    return process.platform === 'win32'
        && process.env._ === undefined;
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */
function mkdir (path, fn) {
    mkdirp(path, 0o755, function (err) {
        if (err) throw err;
        console.log('   \033[36mcreate\033[0m : ' + path);
        fn && fn(path);
    });
}

/**
 * write file.
 *
 * @param {String} path
 * @param {String} str
 * @param {Integer} mode
 */
function write (path, str, mode) {
    fs.writeFileSync(path, str, {mode: mode || 0o666});
    console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory (path, fn) {
    fs.readdir(path, function (err, files) {
        if (err && 'ENOENT' != err.code) throw err;
        fn(!files || !files.length);
    });
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm (msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, function (input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input));
    });
}

function createApplication (app_name, path) {
    let wait = 6;

    const pkg = {
        'name': app_name,
        'version': '1.0.0',
        'description': '',
        'main': 'dist/main.js',
        'repository': {
            'type': '',
            'url': ''
        },
        'files': [
            'dist'
        ],
        'keywords': [],
        'dependencies': {},
        'devDependencies': {
            'autoprefixer-loader': '^3.1.0',
            'babel-core': '^6.22.1',
            'babel-loader': '^7.1.1',
            'babel-plugin-transform-runtime': '^6.22.0',
            'babel-preset-env': '^1.3.2',
            'babel-preset-stage-2': '^6.22.0',
            'babel-register': '^6.22.0',
            'babel-preset-es2015': '^6.1.18',
            'babel-preset-react': '^6.24.1',
            'babel-preset-stage-0': '^6.1.18',
            'babel-runtime': '^6.0.14',
            'css-loader': '^0.21.0',
            'express': '^4.13.3',
            'fastclick': '^1.0.6',
            'file-loader': '^0.8.4',
            'html-webpack-plugin': '^3.2.0',
            'rimraf': '^2.4.4',
            'style-loader': '^0.13.0',
            'connect-history-api-fallback': '^1.5.0',
            'http-proxy-middleware': '^0.18.0',
            'webpack': '^2',
            'webpack-dev-middleware': '^1.2.0',
            'webpack-hot-middleware': '^2.5.0'
        },
        'scripts': {
            'clean': 'rimraf dist',
            'dev': 'node server.js',
            'build': 'webpack --config webpack.build.js'
        },
        'author': {
            'name': '',
            'email': ''
        },
        'license': 'MIT'
    };

    function complete () {
        if (--wait) return;
        const prompt = launchedFromCmd() ? '>' : '$';
        console.log();
        console.log('   install dependencies:');
        console.log('     %s cd %s && npm install', prompt, path);
        console.log();
        console.log('   run the app:');
        console.log('     %s cd %s && npm run dev', prompt, app_name);
        console.log();
        console.log('   build the app:');
        console.log('     %s cd %s && npm run build', prompt, app_name);
        console.log();
    }

    // JavaScript
    const mainJs = loadTemplate('src/main.js');
    let webpackConfig = loadTemplate('file/webpack.config.js');
    let webpackBuild = loadTemplate('file/webpack.build.js');
    const vueConfig = loadTemplate('file/vue.config');
    const sassConfig = loadTemplate('file/sass.config');
    const lessConfig = loadTemplate('file/less.config');
    const server = loadTemplate('file/server.js');

    //html
    const index = loadTemplate('file/index.html');
    const indexTpl = loadTemplate('static/html/index.html');

    //config
    const baberlrc = loadTemplate('file/babelrc');
    const gitignore = loadTemplate('file/gitignore');

    function mkdirSrc (path) {
        mkdir(`${path}/src/assets`);
        mkdir(`${path}/src/components`, (path) => {
            switch (program.jsLib) {
                case 'vue':
                    write(`${path}/HelloWorld.vue`, loadTemplate('vuedemo/HelloWorld.vue'));
                    break;
                case 'react':
                    write(`${path}/HelloWorld.js`, loadTemplate('reactdemo/HelloWorld.js'));
                    break;
                default:
                    break;
            }
            setTimeout(() => {
                complete();
            });
        });
        mkdir(`${path}/src/config`);
        mkdir(`${path}/src/page`);
        mkdir(`${path}/src/util`);
        mkdir(`${path}/src/router`, (path) => {
            switch (program.jsLib) {
                case 'vue':
                    write(`${path}/index.js`, loadTemplate('vuedemo/index.js'));
                    break;
                case 'react':
                    break;
                default:
                    break;
            }
            setTimeout(() => {
                complete();
            });
        });
        mkdir(`${path}/src`, (path) => {
            switch (program.jsLib) {
                case 'vue':
                    write(`${path}/main.js`, loadTemplate('vuedemo/main.js'));
                    write(`${path}/App.vue`, loadTemplate('vuedemo/App.vue'));
                    break;
                case 'react':
                    write(`${path}/main.js`, loadTemplate('reactdemo/main.js'));
                    break;
                default:
                    write(`${path}/main.js`, mainJs);
                    break;
            }
            setTimeout(() => {
                complete();
            });
        });
    }

    function mkdirStatic () {
        mkdir(`${path}/static`);
        mkdir(`${path}/static/image`);
        mkdir(`${path}/static/html`, (path) => {
            write(`${path}/index.html`, indexTpl);
            setTimeout(() => {
                complete();
            });
        });
    }

    function mkdirDist () {
        mkdir(`${path}/dist`, () => {
            setTimeout(() => {
                complete();
            });
        });

    }

    mkdir(path, function () {
        mkdirSrc(path);
        mkdirDist(path);
        mkdirStatic(path);

        // Template support
        switch (program.jsLib) {
            case 'vue':
                pkg.dependencies['vue'] = '^2';
                pkg.dependencies['vue-router'] = '^2';
                pkg.dependencies['vuex'] = '^2';
                pkg.devDependencies['vue-loader'] = '^10.3.0';
                pkg.devDependencies['vue-template-compiler'] = '^2.2.6';
                pkg.devDependencies['vue-style-loader'] = '^1.0.0';
                webpackConfig = webpackConfig.replace('${jsConfig}', vueConfig);
                webpackBuild = webpackBuild.replace('${jsConfig}', vueConfig);
                webpackConfig = webpackConfig.replace('${aliasVueConfig}', `'vue$$':'vue/dist/vue.js',`);
                webpackBuild = webpackBuild.replace('${aliasVueConfig}', `'vue$$':'vue/dist/vue.js',`);
                break;
            case 'react':
                pkg.dependencies['react'] = '^15';
                pkg.dependencies['react-dom'] = '^15';
                pkg.dependencies['react-redux'] = '^5';
                pkg.dependencies['react-router'] = '^4';
                pkg.dependencies['react-router-dom'] = '^4';
                pkg.dependencies['redux'] = '^3';
                pkg.dependencies['redux-persist'] = '^4';
                pkg.dependencies['redux-thunk'] = '^2';
                break;
            default:
                break;
        }
        webpackConfig = webpackConfig.replace('${jsConfig}', '');
        webpackBuild = webpackBuild.replace('${jsConfig}', '');
        webpackConfig = webpackConfig.replace('${aliasVueConfig}', ``);
        webpackBuild = webpackBuild.replace('${aliasVueConfig}', ``);


        // CSS Engine support
        switch (program.css) {
            case 'sass':
                pkg.devDependencies['node-sass'] = '^4.8.3';
                pkg.devDependencies['sass-loader'] = '^6.0.7';
                webpackConfig = webpackConfig.replace('${cssConfig}', sassConfig);
                webpackBuild = webpackBuild.replace('${cssConfig}', sassConfig);
                break;
            default:
                pkg.devDependencies['less'] = '^2.5.3';
                pkg.devDependencies['less-loader'] = '^2.2.1';
                webpackConfig = webpackConfig.replace('${cssConfig}', lessConfig);
                webpackBuild = webpackBuild.replace('${cssConfig}', lessConfig);
                break;
        }

        // sort dependencies like npm(1)
        pkg.dependencies = sortedObject(pkg.dependencies);
        pkg.devDependencies = sortedObject(pkg.devDependencies);

        // write files
        write(`${path}/package.json`, JSON.stringify(pkg, null, 2));
        write(`${path}/webpack.config.js`, webpackConfig);
        write(`${path}/webpack.build.js`, webpackBuild);
        write(`${path}/server.js`, server);
        write(`${path}/index.html`, index);
        write(`${path}/.babelrc`, baberlrc);

        if (program.git) {
            write(`${path}/.gitignore`, gitignore);
        }
        setTimeout(() => {
            complete();
        });
    });
}

/**
 * Main program.
 */

function main () {
    // Path
    const destinationPath = program.args.shift() || '.';

    // App name
    const appName = path.basename(path.resolve(destinationPath));

    // Template engine
    program.jsLib = 'js';
    program.css = 'less';
    if (program.vue) {
        program.jsLib = 'vue';
    }
    if (program.react) {
        program.jsLib = 'react';
    }
    if (program.sass) {
        program.css = 'sass';
    }

    // Generate application
    emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
            createApplication(appName, destinationPath);
        } else {
            confirm('destination is not empty, continue? [y/N] ', function (ok) {
                if (ok) {
                    process.stdin.destroy();
                    createApplication(appName, destinationPath);
                } else {
                    console.error('aborting');
                    exit(1);
                }
            });
        }
    });
}
