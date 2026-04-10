import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';
import plugin from 'eslint-plugin-react';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      exclude: ['packages/template/*'],
    },
  }) 
);
