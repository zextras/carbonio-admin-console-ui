/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

module.exports = (config, pkg, options, mode) => {
	// eslint-disable-next-line no-param-reassign
	config.resolve.alias['app-entrypoint'] = `${__dirname}/src/app.tsx`;
	return config;
};
