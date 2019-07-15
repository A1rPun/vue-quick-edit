module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-quick-edit/' : '/',
  outputDir: 'docs',
  pages: {
    index: {
      entry: 'documentation/main.js',
      template: 'static/index.html',
    },
  },
};
