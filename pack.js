// eslint-disable-next-line @typescript-eslint/no-var-requires
const { run } = require('packrs');

run({
  index: `./demo/index`,
  outDir: './.dev',
  port: 9009,
  rsConfig: {
    html: {
      title: 'Zustand-X Demo',
    },
  },
});
