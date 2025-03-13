/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
type GetInitializedDomainsResponse = {
	domain: [{ name: string; id: string }];
	searchTotal: number;
};

export const getInitializedDomains = async (body: {
	domainName: string;
}): Promise<GetInitializedDomainsResponse> => {
	const result = await fetch(`/service/extension/zextras_admin/admin/getInitializedDomains`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!result.ok) {
		throw new Error(`Error. Status: ${result.status}`);
	}

	try {
		return (await result.json()) as GetInitializedDomainsResponse;
	} catch (error) {
		throw new Error(`Invalid JSON response: ${(error as Error).message}.`);
	}
};
