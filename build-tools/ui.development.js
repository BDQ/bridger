const path = require("path");

module.exports = env => ({
  devServer: {
    port: 8000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "string-replace-loader",
        options: {
          multiple: [
            {
              search: "API_URL",
              replace: "http://localhost:4000/"
            }
          ]
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },
      {
        test: /\.(svelte)$/,
        use: {
          loader: "svelte-loader",
          options: {
            hotReload: true
          }
        }
      }
    ]
  }
});
