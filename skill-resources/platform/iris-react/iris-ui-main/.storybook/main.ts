// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { StorybookConfig } from '@storybook/angular';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../Storybook/**/*.mdx', '../Storybook/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-a11y',
  ],

  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {
    defaultName: 'Documentation',
    docsMode: false,
  },
  webpackFinal: async (config) => {
    config.performance = {
      hints: 'warning',
      maxAssetSize: 10 * 1024 * 1024,
      maxEntrypointSize: 10 * 1024 * 1024,
    };
    return config;
  },
};

export default config;
