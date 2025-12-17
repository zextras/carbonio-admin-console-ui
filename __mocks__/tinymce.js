/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Mock TinyMCE for browser tests
const tinymce = {
	PluginManager: {
		add: () => {}
	},
	ThemeManager: {
		add: () => {}
	},
	ModelManager: {
		add: () => {}
	},
	IconManager: {
		add: () => {}
	},
	init: () => {},
	execCommand: () => {},
	addI18n: () => {},
	util: {
		Delay: {
			setEditorTimeout: () => {}
		},
		Promise: {
			resolve: (value) => Promise.resolve(value)
		}
	}
};

export default tinymce;
