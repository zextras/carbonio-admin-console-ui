/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSignature } from './create-signature-service';
import { deleteSignature } from './delete-signature-service';
import { domainQueryKeys } from './domain-query-keys';
import { modifySignature } from './modify-signature-service';

/**
 * Signature mutations for an account. Hooks own invalidation only; snackbars
 * are shown at the call site via `mutate(vars, { onSuccess, onError })`
 * (recorded repo convention).
 */

export const useCreateSignature = (accountId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ name, content }: { name: string; content: string }) =>
			createSignature(accountId, name, content),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.accountSignatures(accountId),
			});
		},
	});
};

export const useDeleteSignature = (accountId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ signatureIds }: { signatureIds: Array<string> }) =>
			Promise.all(signatureIds.map((signatureId) => deleteSignature(accountId, signatureId))),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.accountSignatures(accountId),
			});
		},
	});
};

export const useModifySignature = (accountId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			signatureId,
			name,
			content,
		}: {
			signatureId: string;
			name: string;
			content: string;
		}) => modifySignature(accountId, signatureId, name, content),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.accountSignatures(accountId),
			});
		},
	});
};
