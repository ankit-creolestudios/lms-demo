const CracoEsbuildPlugin = require('craco-esbuild');

module.exports = {
    plugins: [{ plugin: CracoEsbuildPlugin }],
    style: {
        sass: {
            loaderOptions: {
                additionalData: `@import "./src/scss/globals";`,
            },
        },
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    typescript: {
        enableTypeChecking: true /* (default value)  */,
    },
};
