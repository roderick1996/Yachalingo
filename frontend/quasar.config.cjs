module.exports = function (/* ctx */) {
  return {
    boot: ['pinia'],
    css: ['app.scss'],
    extras: ['material-icons'],
    framework: {
      plugins: ['Notify', 'Dialog'],
      config: { notify: { position: 'top' } },
    },
    build: {
      vueRouterMode: 'history',
      target: { browser: ['es2022'] },
    },
    devServer: {
      port: 9000,
      proxy: {
        '/api': 'http://localhost:3000',
        '/uploads': 'http://localhost:3000',
      },
    },
  };
};
