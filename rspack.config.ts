import type { Configuration } from '@rspack/core';
import { DefinePlugin } from '@rspack/core';
import path from 'path';
import dotenv from 'dotenv';
import HtmlWebpackPlugin from 'html-webpack-plugin';

dotenv.config(); // Load .env variables

const isOfflineMode = process.env.NODE_ENV === 'development' && process.env.OFFLINE_MODE === 'true';

const config: Configuration = {
  entry: './frontend/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  // Enable polling to ensure file changes are detected reliably on WSL/Windows filesystems
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './frontend/index.html', // your HTML template
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.OFFLINE_MODE': JSON.stringify(process.env.OFFLINE_MODE || 'false')
    })
  ],

  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'dist'),
        // Also watch the output directory in dev for full page reload when HTML changes
        watch: {
          poll: 1000,
        }
      },
      {
        directory: path.join(__dirname, 'frontend/public'),
        publicPath: '/',
        watch: {
          poll: 1000,
        }
      }
    ],
    watchFiles: {
      paths: [
        'frontend/**/*',
        'frontend/public/**/*',
        'frontend/index.html'
      ],
      options: {
        poll: 1000,
      }
    },
    port: Number(process.env.FRONTEND_PORT) || (isOfflineMode ? 5174 : 5173),
    proxy: isOfflineMode ? undefined : [
      {
        context: ['/api'],
        target: process.env.API_URL || 'http://localhost:3000',
        changeOrigin: true,
      }
    ],
    hot: true,
    liveReload: true,
    client: {
      overlay: true,
      progress: true,
      reconnect: 5,
    },
    open: true,
    historyApiFallback: true,
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
                  tsx: true
                },
                target: 'es2020',
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: process.env.NODE_ENV !== 'production'
                  }
                }
              }
            }
          }
        ],
        exclude: /node_modules/,
      },
    ],
    parser: {
      'css/auto': {
        namedExports: false,
      },
    },
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  experiments: {
    css: true,
  },
};

export default config;
