/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { soapFetch } from '@zextras/admin-ui-bootstrap';

import { Server } from '../../types/server';

type MailstoreServersOptions = {
	enabled?: boolean;
};

// Query function to fetch mailstore servers
const queryFn = async (): Promise<Array<Server>> => {
	const response = await soapFetch(`GetAllServers`, {
		_jsns: 'urn:zimbraAdmin',
		attrs: 'description,zimbraServiceHostname,zimbraId',
		service: 'mailbox'
	}) as any;

	const server = response?.server;
	return (server && Array.isArray(server) ? server : []) as Array<Server>;
};

export const useMailstoreServers = (options: MailstoreServersOptions = {}) => {
	const { enabled = true } = options;

	return useQuery({
		queryKey: ['mailstore-servers'],
		queryFn,
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true
	});
};