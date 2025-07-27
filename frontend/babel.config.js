module.exports = function (api) {
  api.cache(true);
  return {
     presets: ['babel-preset-expo'], // or ['module:metro-react-native-babel-preset'] if not using Expo
    plugins: [
      ['dotenv-import', {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      }]
    ]
  };
};