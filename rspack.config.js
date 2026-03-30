const path = require('node:path');
const {
	CopyRspackPlugin,
	DefinePlugin,
	ProvidePlugin,
} = require('@rspack/core');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const stdLibBrowser = require('node-stdlib-browser');
const {
	NodeProtocolUrlPlugin,
} = require('node-stdlib-browser/helpers/webpack/plugin');

const isOfflineMode =
	process.env.NODE_ENV === 'development' && process.env.OFFLINE_MODE === 'true';
const isDevelopment = process.env.NODE_ENV !== 'production';
const appBasePath = normalizeBasePath(process.env.APP_BASE_PATH || '/');
const usesRelativeAssetPaths =
	process.env.APP_ROUTER_MODE === 'hash' && appBasePath !== '/';

function normalizeBasePath(basePath) {
	const trimmed = basePath.trim();
	if (!trimmed || trimmed === '/') {
		return '/';
	}

	return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

/** @type {import('@rspack/core').Configuration} */
module.exports = {
	entry: './frontend/main.tsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: isDevelopment ? '[name].js' : '[name].[contenthash:8].js',
		chunkFilename: isDevelopment
			? '[name].chunk.js'
			: '[name].[contenthash:8].chunk.js',
		publicPath: usesRelativeAssetPaths ? '' : appBasePath,
	},
	experiments: {
		css: true,
	},
	watchOptions: {
		ignored: /node_modules/,
		poll: 1000,
	},
	devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
	plugins: [
		new HtmlWebpackPlugin({
			template: './frontend/index.html',
		}),
		new CopyRspackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'frontend/public'),
					to: path.resolve(__dirname, 'dist'),
				},
			],
		}),
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(
				process.env.NODE_ENV || 'development',
			),
			'process.env.OFFLINE_MODE': JSON.stringify(
				process.env.OFFLINE_MODE || 'false',
			),
			'process.env.APP_BASE_PATH': JSON.stringify(appBasePath),
			'process.env.APP_ROUTER_MODE': JSON.stringify(
				process.env.APP_ROUTER_MODE || 'browser',
			),
		}),
		new NodeProtocolUrlPlugin(),
		new ProvidePlugin({
			stream: stdLibBrowser.stream,
		}),
	],
	devServer: {
		host: '127.0.0.1',
		static: [
			{
				directory: path.join(__dirname, 'dist'),
				watch: {
					poll: 1000,
				},
			},
			{
				directory: path.join(__dirname, 'frontend/public'),
				publicPath: '/',
				watch: {
					poll: 1000,
				},
			},
		],
		watchFiles: {
			paths: ['frontend/**/*', 'frontend/public/**/*', 'frontend/index.html'],
			options: {
				poll: 1000,
			},
		},
		port: Number(process.env.FRONTEND_PORT) || (isOfflineMode ? 5174 : 5173),
		historyApiFallback: true,
		proxy: isOfflineMode
			? undefined
			: [
					{
						context: ['/api'],
						target: process.env.API_URL || 'http://localhost:3000',
						changeOrigin: true,
					},
				],
		hot: true,
		liveReload: true,
		client: {
			overlay: true,
			progress: true,
			reconnect: 5,
		},
		open: false,
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				use: [
					{
						loader: 'builtin:swc-loader',
						options: {
							jsc: {
								parser: {
									syntax: 'typescript',
									tsx: true,
								},
								target: 'es2020',
								transform: {
									react: {
										runtime: 'automatic',
										development: process.env.NODE_ENV !== 'production',
									},
								},
							},
						},
					},
				],
				exclude: /node_modules/,
			},
			{
				test: /\.module\.css$/,
				type: 'css/module',
				generator: {
					localIdentName: '[name]__[local]--[hash:base64:5]',
				},
			},
			{
				test: /\.css$/,
				exclude: /\.module\.css$/,
				type: 'css',
			},
			{
				test: /\.m?js$/,
				resolve: {
					fullySpecified: false,
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
		alias: {
			...stdLibBrowser,
		},
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
		runtimeChunk: 'single',
	},
};
