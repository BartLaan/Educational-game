var path = require('path')
var webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

function resolve(dir) {
	return path.join(__dirname, dir)
}
function cachePath(path) {
	return './node_modules/.cache/' + path
}

module.exports = {
	entry: resolve('src/init.ts'),
	output: {
		path: resolve('bundle'),
		filename: 'main.bundle.js',
	},
	devtool: 'source-map',
	resolve: {
		alias: {
			'~': resolve('src'),
		},
		extensions: ['.js', '.ts'],
		modules: [
			'node_modules',
		],
	},
	module: {
		rules: [
			// TypeScript
			{
				enforce: 'pre',
				include: [resolve('src')],
				use: [
					{
						loader: 'tslint-loader',
						options: {
							configFile: resolve('tslint.json'),
							emitWarning: true,
							failOnWarning: false,
							failOnError: false,
							tsConfigFile: resolve('tsconfig.json'),
						},
					},
				],
				test: /\.tsx?$/,
			},
			{
				include: [resolve('src')],
				use: [{
					loader: 'awesome-typescript-loader',
					options: {
						babelCore: "@babel/core",
						cacheDirectory: cachePath('awcache'),
						configFileName: resolve('tsconfig.json'),
						silent: process.argv.indexOf("--json") !== -1,
						useBabel: true,
						useCache: true,
						useTranspileModule: true,
						babelOptions: {
							babelrc: false,
							presets: [
								[ "@babel/preset-env", {
									corejs: "2.6.5",
									debug: false,
									modules: false,
									targets: [">1%", "edge > 15"],
									useBuiltIns: "entry",
								} ]
							]
						},
					},
				}],
				test: /\.(j|t)sx?$/,
			},
		],
	},
	optimization: {
		minimizer: [new UglifyJsPlugin({
			parallel: true,
			sourceMap: true,
			uglifyOptions: {
				comments: false,
				compress: {
					booleans: true,
					conditionals: true,
					dead_code: true,
					drop_debugger: true,
					evaluate: true,
					if_return: false,
					join_vars: true,
					passes: 2,
					pure_getters: true,
					sequences: true,
					unused: true,
					warnings: false,
				},
				mangle: true,
				sourceMap: true,
				toplevel: true,
			},
		})],
	},
	watchOptions: {
		ignored: /node_modules/,
	},
}
