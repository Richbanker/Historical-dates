import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default {
  entry: "./src/main.ts",
  output: {
    path: path.resolve(process.cwd(), "dist"),
    filename: "assets/bundle.[contenthash].js",
    clean: true
  },
  devtool: "source-map",
  devServer: {
    static: path.resolve(process.cwd(), "public"),
    port: 5173,
    hot: true
  },
  resolve: { extensions: [".ts", ".js"] },
  module: {
    rules: [
      { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1 } },
          "postcss-loader",
          "sass-loader"
        ]
      },
      { test: /\.(png|jpg|jpeg|gif|svg)$/i, type: "asset" }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./public/index.html", inject: "body" }),
    new MiniCssExtractPlugin({ filename: "assets/main.[contenthash].css" })
  ]
};

