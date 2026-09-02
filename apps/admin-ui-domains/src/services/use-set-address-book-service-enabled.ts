/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { setAddressBookServiceEnabled } from './set-address-book-service-enabled';

export const useSetAddressBookServiceEnabled = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (enabled: boolean) => setAddressBookServiceEnabled(enabled),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: domainQueryKeys.addressBookService() });
		},
	});
};
