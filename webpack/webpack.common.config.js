const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const fs = require("fs");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");

const PATHS = {
    index: path.join(__dirname, "../src/scripts/"),
    about: path.join(__dirname, "../src/scripts/about.js"),
    src: path.join(__dirname, "../src/"),
    dist: path.join(__dirname, "../dist"),
};

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const filename = (ext) =>
    isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const PAGES_DIR = `${PATHS.src}`;
const PAGES = fs
    .readdirSync(PAGES_DIR)
    .filter((fileName) => fileName.endsWith(".pug"));

module.exports = {
    externals: {
        paths: PATHS,
    },

    entry: {
        app: ["babel-polyfill", PATHS.index],
        about: [PATHS.about],
    },
    output: {
        filename: `./scripts/${filename("js")}`,
        path: PATHS.dist,
        publicPath: "",
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: "vendors",
                    test: /node_modules/,
                    chunks: "all",
                    enforce: true,
                },
            },
        },
        minimizer: [new UglifyJsPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: [
                            "@babel/plugin-proposal-object-rest-spread",
                            "@babel/plugin-proposal-class-properties",
                            "transform-regenerator",
                        ],
                    },
                },
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loader: {
                        scss: "vue-style-loader!css-loader!sass-loader",
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    isDev
                        ? "style-loader"
                        : {
                              loader: MiniCssExtractPlugin.loader,
                              options: {
                                  publicPath: "../",
                              },
                          },
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [["postcss-preset-env"]],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    isDev
                        ? "style-loader"
                        : {
                              loader: MiniCssExtractPlugin.loader,
                              options: {
                                  publicPath: "../",
                              },
                          },
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [["postcss-preset-env"]],
                            },
                        },
                    },
                    "sass-loader",
                ],
            },
            {
                test: /\.html$/,
                loader: "html-loader",
            },
            {
                test: /\.(?:png|svg|jpg|jpeg|gif)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: `./assets/img/${filename("[ext]")}`,
                            esModule: false,
                        },
                    },
                    {
                        loader: "image-webpack-loader",
                        options: {
                            mozjpeg: {
                                progressive: true,
                            },
                            optipng: {
                                enabled: false,
                            },
                            pngquant: {
                                quality: [0.65 ,0.9],
                                speed: 4,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            webp: {
                                quality: 75,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader",
                options: {
                    name: "assets/fonts/[name].[ext]",
                    publicPath: "../",
                },
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: `./css/${filename("css")}`,
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: `src/pages/index.pug`,
            filename: `${`index.pug`.replace(/\.pug/, ".html")}`,
            chunks: ["app"],
        }),
        new HtmlWebpackPlugin({
            template: `src/pages/about.pug`,
            filename: `${`about.pug`.replace(/\.pug/, ".html")}`,
            chunks: ["about"],
        }),
        new ImageMinimizerPlugin({
            minimizerOptions: {
                plugins: [
                    [
                        "svgo",
                        {
                            plugins: [
                                {
                                    removeViewBox: false,
                                },
                            ],
                        },
                    ],
                ],
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: `${PATHS.src}/assets/static`, to: `assets/static` },
            ],
        }),
        new StylelintPlugin({
            configFile: path.resolve(__dirname, "../stylelint.config.js"),
            context: path.resolve(__dirname, "../src/styles"),
            files: "**/*.scss",
        }),
    ],
};
