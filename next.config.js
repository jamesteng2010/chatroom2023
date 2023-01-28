/** @type {import('next').NextConfig} */
const WebpackBar = require('webpackbar');
const nextConfig = {
  experimental: {
    appDir: true,
  },
  plugins: [
    new WebpackBar()
  ]
}

module.exports = nextConfig
