/** @type {import('next').NextConfig} */
const WebpackBar = require('webpackbar');
const nextConfig = {
 
  plugins: [
    new WebpackBar()
  ]
}

module.exports = nextConfig
