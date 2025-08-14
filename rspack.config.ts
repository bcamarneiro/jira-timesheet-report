import type { Configuration } from '@rspack/core';
import { DefinePlugin } from '@rspack/core';
import path from 'path';
import dotenv from 'dotenv';
import HtmlWebpackPlugin from 'html-webpack-plugin';

dotenv.config(); // Load .env variables

const config: Configuration = {
  entry: './frontend/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './frontend/index.html', // your HTML template
    }),
    new DefinePlugin({
      'process.env.TEAM_DEVELOPERS': JSON.stringify(process.env.TEAM_DEVELOPERS || '')
    })
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: Number(process.env.FRONTEND_PORT) || 5173,
    proxy: [
      {
        context: ['/api'],
        target: process.env.API_URL || 'http://localhost:3000',
        changeOrigin: true,
      }
    ],
    hot: true,
    open: true,
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
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
};

export default config;
