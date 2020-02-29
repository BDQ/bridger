const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = env => ({
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "../dist/ui")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "string-replace-loader",
        options: {
          multiple: [
            {
              search: "SESSION_URL",
              replace: process.env["SESSION_URL"]
            },
            {
              search: "API_URL",
              replace: process.env["API_URL"]
            }
          ]
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: MiniCssExtractPlugin.loader }, { loader: "css-loader" }]
      },
      {
        test: /\.(svelte)$/,
        use: {
          loader: "svelte-loader",
          options: {
            emitCss: true
          }
        }
      }
    ]
  },
  plugins: [new MiniCssExtractPlugin()]
});
