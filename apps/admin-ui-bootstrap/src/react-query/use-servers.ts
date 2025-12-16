/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { Attribute } from '../../types';
import { soapFetch } from '../network/fetch';

type Server = {
	id?: string;
	name?: string;
	a?: Array<Attribute>;
};

type ServersOptions = Omit<UseQueryOptions<Array<Server>>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
};

// Query function for all servers
const queryFn = async (): Promise<Array<Server>> => {
	const response = await soapFetch('GetAllServers', {
		_jsns: 'urn:zimbraAdmin',
		attrs: 'description,zimbraServiceHostname,zimbraId'
	});

	const server = (response as any)?.server;
	return (server && Array.isArray(server) ? server : []) as Array<Server>;
};

// Query function for servers by service
const queryFnByService = async (serviceName: string): Promise<Array<Server>> => {
	const response = await soapFetch('GetAllServers', {
		_jsns: 'urn:zimbraAdmin',
		service: serviceName
	});

	const server = (response as any)?.server;
	return (server && Array.isArray(server) ? server : []) as Array<Server>;
};

export const useAllServers = (options: ServersOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	return useQuery({
		queryKey: ['all-servers'],
		queryFn,
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		...queryOptions
	});
};

export const useServersByService = (serviceName: string, options: ServersOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	return useQuery({
		queryKey: ['servers-by-service', serviceName],
		queryFn: () => queryFnByService(serviceName),
		enabled: enabled && Boolean(serviceName),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		...queryOptions
	});
};

// Specific hook for MTA servers
export const useMtaServers = (options: ServersOptions = {}) => {
	return useServersByService('mta', options);
};
