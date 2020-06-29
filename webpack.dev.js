const path = require("path");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "server.js",
  },
  plugins: [new CleanWebpackPlugin()],
});
