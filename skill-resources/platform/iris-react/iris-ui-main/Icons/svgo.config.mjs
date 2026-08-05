/** @type {import('svgo').Config} */
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Replace all non-"none" colors with currentColor so consumers can
          // style icons via CSS color/fill/stroke without runtime hex patching.
          convertColors: { currentColor: true },
        },
      },
    },
  ],
};
