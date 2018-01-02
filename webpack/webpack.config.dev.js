const options = {
    node_env: "development",
    isProduction: false,
    devtool: "eval-source-map",
    entry: ["webpack-hot-middleware/client?reload=true", "./src/index"]
};

const config = require("./webpack.config.helper")(options);
const modConfig = require("./webpack.config.mod")(config);

export default modConfig;
