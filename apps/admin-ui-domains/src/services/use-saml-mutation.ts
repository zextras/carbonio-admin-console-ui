/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteSamlAttributes } from './delete-saml-attributes';
import { domainQueryKeys } from './domain-query-keys';
import { generateSignedCertificate } from './generate-signed-certificate';
import { importSamlConfig } from './import-saml-configurations';
import { updateSamlAttributes } from './update-saml-attributes';

export type SamlMutationInput =
	| { op: 'import'; url: string; allowUnsecure: boolean }
	| { op: 'generate' }
	| { op: 'saveAttribute'; key: string; value: unknown }
	| { op: 'removeAttribute'; key: string }
	| { op: 'deleteConfig' };

async function assertNoError(res: any): Promise<void> {
	if (res?.error) {
		throw new Error(res.error);
	}
}

export const useSamlMutation = (domain: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: SamlMutationInput): Promise<void> => {
			switch (input.op) {
				case 'import':
					await assertNoError(await importSamlConfig(domain, input.url, input.allowUnsecure));
					return;
				case 'generate':
					await assertNoError(await generateSignedCertificate(domain));
					return;
				case 'saveAttribute':
					await assertNoError(
						await updateSamlAttributes(domain, { [input.key]: input.value }),
					);
					return;
				case 'removeAttribute':
					await assertNoError(await deleteSamlAttributes(domain, input.key));
					return;
				case 'deleteConfig':
					await assertNoError(await deleteSamlAttributes(domain));
					return;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: domainQueryKeys.samlConfig(domain) });
		},
	});
};
