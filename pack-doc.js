// eslint-disable-next-line @typescript-eslint/no-var-requires
const { build } = require('packrs');

build({
  index: `./demo/index`,
  dist: './docs',
  rsConfig: {
    html: {
      title: 'Zustand-Kit Demo',
    },
    output: {
      assetPrefix: './',
    },
  },
});
