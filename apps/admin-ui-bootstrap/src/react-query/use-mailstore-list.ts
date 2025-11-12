/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { getSoapFetch } from '../network/fetch';

const soapFetch = getSoapFetch('admin-ui-console');

export type MailstoreServer = {
	id: string;
	name: string;
	a?: Array<{
		n: string;
		_content: string;
		c?: boolean;
	}>;
	description?: string;
	zimbraServiceHostname?: string;
	zimbraId?: string;
	attrs?: Record<string, string>;
};

export type MailstoreListOptions = {
	enabled?: boolean;
};

/**
 * Query function to fetch all mailstore servers
 */
export const queryFn = async (): Promise<MailstoreServer[]> => {
	const response = await soapFetch('GetAllServers', {
		_jsns: 'urn:zimbraAdmin',
		attrs: 'description,zimbraServiceHostname,zimbraId',
		service: 'mailbox'
	});

	const servers = (response as any)?.server;
	if (!servers || !Array.isArray(servers)) {
		return [];
	}

	return servers.map((server: any) => {
		const serverData: MailstoreServer = {
			id: server.id || server.zimbraId,
			name: server.name || server.zimbraServiceHostname || server.id,
		};

		// Add a property if attributes exist
		if (server.a && Array.isArray(server.a)) {
			serverData.a = server.a;
		}

		// Add description if it exists
		if (server.description) {
			serverData.description = server.description;
		}

		// Add other properties if they exist
		if (server.zimbraServiceHostname) {
			serverData.zimbraServiceHostname = server.zimbraServiceHostname;
		}
		if (server.zimbraId) {
			serverData.zimbraId = server.zimbraId;
		}
		if (server.attrs) {
			serverData.attrs = server.attrs;
		}

		return serverData;
	});
};

export const queryKeys = {
	all: ['mailstore-list'] as const,
	servers: () => [...queryKeys.all, 'servers'] as const
};

/**
 * Hook to fetch all mailstore servers
 */
export const useMailstoreList = (options: MailstoreListOptions = {}) => {
	const { enabled = true } = options;

	return useQuery({
		queryKey: queryKeys.servers(),
		queryFn,
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		select: (data) => data.filter(Boolean)
	});
};