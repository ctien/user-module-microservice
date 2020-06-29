const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",

  resolve: { extensions: [".js", ".ts"] },
  target: "node",
  mode: "none",
  externals: [/node_modules/],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
    ],
  },
};
