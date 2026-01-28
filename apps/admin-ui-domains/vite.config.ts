/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resolve } from 'node:path';
import { defineConfig } from 'vite';

import { createAppViteConfig } from '../../vite.app.config';

export default defineConfig((config) =>
  createAppViteConfig({
    additionalAliases: {
      'tinymce/tinymce': resolve(__dirname, 'node_modules/tinymce/tinymce.min.js'),
    },
    mode: config.mode,
  }),
);
