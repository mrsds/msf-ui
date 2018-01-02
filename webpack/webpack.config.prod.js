const options = {
    node_env: "production",
    isProduction: true
};

const config = require("./webpack.config.helper")(options);
const modConfig = require("./webpack.config.mod")(config);

export default modConfig;
