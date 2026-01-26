/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resolve } from 'node:path';

import { createAppViteConfig } from '../../vite.app.config';

export default createAppViteConfig({
	additionalAliases: {
		'tinymce/tinymce': resolve(__dirname, 'node_modules/tinymce/tinymce.min.js'),
	},
});
