var path = require("path")
var webpack = require("webpack")
var HtmlWebpackPlugin = require("html-webpack-plugin")

const env = process.env.NODE_ENV
const entry = {
    development: "./example/main.js",
    production: "./src/index.js"
}
console.log("==================")
console.log(process.env.NODE_ENV)
console.log("==================")
module.exports = {
    entry: entry[env],
    // output: {
    // 	path: path.resolve(__dirname, "./dist"),
    // 	publicPath: "/dist/",
    // 	filename: "build.js",
    // },
    output: {
        path: path.resolve(__dirname, "./dist"),
        publicPath: "",
        filename: "build.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["vue-style-loader", "css-loader"]
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {}
                    // other vue-loader options go here
                }
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]?[hash]"
                }
            }
        ]
    },
    resolve: {
        alias: {
            vue$: "vue/dist/vue.esm.js"
        },
        extensions: ["*", ".js", ".vue", ".json"]
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        overlay: true
    },
    performance: {
        hints: false
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./example/index.html",
            inject: true
        })
    ],
    devtool: "#eval-source-map"
}

if (env === "production") {
    module.exports.devtool = "#source-map"
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
