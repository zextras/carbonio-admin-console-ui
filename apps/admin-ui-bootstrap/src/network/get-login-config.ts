/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const getLoginConfig = async (
	version: string,
	domain: string,
	host: string
): Promise<any> => {
	const urlParams = new URLSearchParams();
	if (domain) urlParams.append('domain', domain);
	if (host) urlParams.append('host', host);
	return fetch(`/zx/login/v${version}/config?${urlParams}`, {
		method: 'GET'
	}).then((res) => {
		if (res.status === 200) return res.json();
		throw Error('Network Error');
	});
};
