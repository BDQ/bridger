const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const CleanWebpackPlugin = require("clean-webpack-plugin");

const path = require("path");

const envConfig = (stack, env) =>
  require(`./build-tools/${stack}.${env.mode}.js`)(env);

module.exports = env => {
  return webpackMerge.multiple(
    {
      api: {
        name: "api",
        mode: env.mode,
        entry: {
          putListeners: "./src/api/listeners/put/index.ts",
          readListener: "./src/api/listeners/read/index.ts",
          processIncoming: "./src/api/process/incoming/index.ts",
          listEvents: "./src/api/events/list/index.ts",
          graphql: "./src/api/graphql/index.ts",
          gqlocal: "./src/api/graphql/local.ts"
        },
        target: "node",
        performance: {
          maxEntrypointSize: 2510000,
          maxAssetSize: 2510000
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              use: "ts-loader",
              exclude: /node_modules/
            }
          ]
        },
        resolve: {
          extensions: [".ts", ".mjs", ".js"],
          alias: {
            "@shared": path.resolve(__dirname, "src/api/shared/"),
            "@persistence": path.resolve(
              __dirname,
              "src/api/shared/data/persistence"
            ),
            "@models": path.resolve(__dirname, "src/api/shared/data/models")
          }
        },
        output: {
          // filename: "[name]/[contenthash].js",
          filename: "[name]/index.js",
          sourceMapFilename: "[name]/[filebase].map",
          libraryTarget: "commonjs2",
          path: path.resolve(__dirname, "dist/lambdas")
        }

        // plugins: [new CleanWebpackPlugin()]
      },
      ui: {
        name: "ui",
        mode: env.mode,
        entry: {
          bundle: ["./src/ui/index.js"]
        },
        module: {
          rules: [
            {
              test: /\.(png|svg|jpg|gif)$/,
              use: ["file-loader"]
            }
          ]
        },
        resolve: {
          extensions: [".wasm", ".mjs", ".js", ".svelte", ".json"],
          mainFields: ["svelte", "browser", "module", "main"]
        },
        plugins: [
          new webpack.ProgressPlugin(),
          new HtmlWebpackPlugin({
            template: "./src/ui/public/index.html",
            favicon: "./src/ui/public/favicon.png"
          })
        ]
      }
    },
    {
      ui: envConfig("ui", env),
      api: envConfig("api", env)
    }
  );
};
