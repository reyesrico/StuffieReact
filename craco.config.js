// craco.config.js
// Configure Create React App without ejecting
// Docs: https://craco.js.org/

module.exports = {
  style: {
    sass: {
      loaderOptions: {
        // Use the modern Sass API instead of the legacy JS API
        // This eliminates the deprecation warning:
        // "The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0"
        api: 'modern',
        sassOptions: {
          // Silence the @import deprecation warnings until full migration
          silenceDeprecations: ['import'],
        },
      },
    },
  },
  // Silence the webpack-dev-server middleware deprecation warnings
  devServer: (devServerConfig) => {
    // Remove deprecated options if they exist
    delete devServerConfig.onAfterSetupMiddleware;
    delete devServerConfig.onBeforeSetupMiddleware;
    
    // Use the new setupMiddlewares option if needed
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      return middlewares;
    };
    
    return devServerConfig;
  },
};
