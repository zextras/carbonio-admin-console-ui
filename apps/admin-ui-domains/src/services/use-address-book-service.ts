/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getAddressBookServices } from './get-address-book-services';

export const useAddressBookServiceStatus = () =>
	useQuery({
		queryKey: domainQueryKeys.addressBookService(),
		queryFn: getAddressBookServices,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
