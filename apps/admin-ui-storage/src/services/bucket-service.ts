/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import {
	CreateS3ConnectorRequest,
	DeleteS3ConnectorRequest,
	ListS3ConnectorResponseContent,
	ListS3RegionsResponseContent,
	S3Connector,
	S3ConnectorMutationResponse,
	S3Region,
	UpdateS3ConnectorRequest,
} from '../../types';

declare global {
	interface Window {
		csrfToken: string;
	}
}
export const fetchSoap = async (api: string, body: unknown): Promise<unknown> =>
	postSoapFetchRequest(`/service/admin/soap/${api}`, body, api);

type SoapContentResponse = {
	Body?: {
		response?: {
			content?: string;
		};
	};
};

function parseSoapContent<T>(res: SoapContentResponse): T {
	const content = res?.Body?.response?.content;
	if (!content) {
		throw new Error('Missing SOAP response content');
	}

	return JSON.parse(content) as T;
}

export async function listS3Regions(): Promise<Array<S3Region>> {
	const body = {
		_jsns: 'urn:zimbraAdmin',
		module: 'ZxPowerstore',
		action: 'listS3Regions',
	};

	const res = (await fetchSoap('zextras', body)) as SoapContentResponse;
	const parsed = parseSoapContent<ListS3RegionsResponseContent>(res);

	if (!parsed.ok) {
		throw new Error(parsed.error || 'Failed to list S3 regions');
	}

	return parsed.response?.values ?? [];
}

export async function listS3Connector(): Promise<Array<S3Connector>> {
	const body = {
		_jsns: 'urn:zimbraAdmin',
		module: 'ZxPowerstore',
		action: 'listS3Connector',
	};

	const res = (await fetchSoap('zextras', body)) as SoapContentResponse;
	const parsed = parseSoapContent<ListS3ConnectorResponseContent>(res);

	if (!parsed.ok) {
		throw new Error(parsed.error || 'Failed to list S3 connectors');
	}

	return parsed.response?.values ?? [];
}

export async function createS3Connector(
	payload: CreateS3ConnectorRequest,
): Promise<S3ConnectorMutationResponse> {
	const res = (await fetchSoap('zextras', payload)) as SoapContentResponse;
	return parseSoapContent<S3ConnectorMutationResponse>(res);
}

export async function updateS3Connector(
	payload: UpdateS3ConnectorRequest,
): Promise<S3ConnectorMutationResponse> {
	const res = (await fetchSoap('zextras', payload)) as SoapContentResponse;
	return parseSoapContent<S3ConnectorMutationResponse>(res);
}

export async function deleteS3Connector(
	payload: DeleteS3ConnectorRequest,
): Promise<S3ConnectorMutationResponse> {
	const res = (await fetchSoap('zextras', payload)) as SoapContentResponse;
	return parseSoapContent<S3ConnectorMutationResponse>(res);
}
