module.exports = api => {
    api.cache(true);
    return {
        presets: ['@babel/preset-typescript', ['@babel/preset-env', {targets: {node: 'current'}}]], plugins: ['@babel/plugin-transform-modules-commonjs', '@babel/plugin-proposal-class-properties']
    }
}
