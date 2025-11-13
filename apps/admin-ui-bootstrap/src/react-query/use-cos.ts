/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { getSoapFetch } from '../network/fetch';

const soapFetch = getSoapFetch('admin-ui-cos');

type Attribute = {
	n: string;
	_content: string;
	c?: boolean;
};

type Cos = {
	id?: string;
	name?: string;
	isDefaultCos?: boolean;
	a?: Array<Attribute>;
};

type CosListResponse = {
	cos?: Array<Cos>;
	total?: number;
	more?: boolean;
	offset?: number;
};

type CosGeneralInformation = Cos & {
	totalAccount?: number;
	totalDomain?: number;
};

/**
 * Query function to search COS list
 */
const searchCosQueryFn = async (params: {
	searchKeyWord?: string;
	limit?: number;
	offset?: number;
}): Promise<CosListResponse> => {
	const response = await soapFetch('SearchDirectory', {
		_jsns: 'urn:zimbraAdmin',
		limit: params.limit ?? 50,
		offset: params.offset ?? 0,
		sortBy: 'cn',
		sortAscending: '1',
		applyCos: 'false',
		applyConfig: 'false',
		attrs: 'cn,description',
		types: 'coses',
		query: params.searchKeyWord
			? {
					_content: `(|(cn=*${params.searchKeyWord}*))`
				}
			: undefined
	});

	return {
		cos: (response as any)?.cos || [],
		total: (response as any)?.total || 0,
		more: (response as any)?.more || false,
		offset: (response as any)?.offset || 0
	};
};

/**
 * Query function to get COS general information
 */
export const getCosQueryFn = async (cosId: string): Promise<CosGeneralInformation> => {
	const response = await soapFetch('GetCos', {
		_jsns: 'urn:zimbraAdmin',
		cos: {
			by: 'id',
			_content: cosId
		}
	});

	const cos = (response as any)?.cos?.[0];
	if (!cos) {
		throw new Error('COS not found');
	}

	// Note: account and domain counts would be fetched separately if needed
	// For now, we'll return the COS data without counts
	return {
		...cos,
		totalAccount: 0,
		totalDomain: 0
	};
};

export const queryKeys = {
	all: ['cos'] as const,
	list: () => [...queryKeys.all, 'list'] as const,
	detail: (id: string) => [...queryKeys.all, 'detail', id] as const
};

/**
 * Hook to search COS list
 */
export const useCosList = (
	params: {
		searchKeyWord?: string;
		limit?: number;
		offset?: number;
		enabled?: boolean;
	} = {}
) => {
	const { enabled = true } = params;

	return useQuery({
		queryKey: [...queryKeys.list(), params.searchKeyWord, params.limit, params.offset],
		queryFn: () => searchCosQueryFn(params),
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
		retry: 3
	});
};

/**
 * Hook to get COS general information
 */
export const useCosGeneralInformation = (cosId: string, enabled = true) => {
	return useQuery({
		queryKey: queryKeys.detail(cosId),
		queryFn: () => getCosQueryFn(cosId),
		enabled: enabled && !!cosId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 3
	});
};

/**
 * Hook to create COS
 */
export const useCreateCos = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (cosData: Partial<Cos>) => {
			const response = await soapFetch('CreateCos', {
				_jsns: 'urn:zimbraAdmin',
				cos: {
					name: cosData.name,
					a: cosData.a
				}
			});

			return (response as any)?.cos?.[0];
		},
		onSuccess: () => {
			createSnackbar({
				key: 'create-cos-success',
				severity: 'success',
				label: t('cos.created_successfully', 'COS created successfully'),
				autoHideTimeout: 4000,
				hideButton: true
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.list() });
		},
		onError: (error) => {
			createSnackbar({
				key: 'create-cos-error',
				severity: 'error',
				label: t('cos.error_creating', 'Error creating COS'),
				autoHideTimeout: 4000,
				hideButton: true
			});
		}
	});
};

/**
 * Hook to modify COS
 */
export const useModifyCos = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (cosData: Cos) => {
			const response = await soapFetch('ModifyCos', {
				_jsns: 'urn:zimbraAdmin',
				id: cosData.id,
				a: cosData.a
			});

			return (response as any)?.cos?.[0];
		},
		onSuccess: (_, variables) => {
			createSnackbar({
				key: 'modify-cos-success',
				severity: 'success',
				label: t('cos.modified_successfully', 'COS modified successfully'),
				autoHideTimeout: 4000,
				hideButton: true
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.list() });
			queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id || '') });
		},
		onError: (error) => {
			createSnackbar({
				key: 'modify-cos-error',
				severity: 'error',
				label: t('cos.error_modifying', 'Error modifying COS'),
				autoHideTimeout: 4000,
				hideButton: true
			});
		}
	});
};

/**
 * Hook to delete COS
 */
export const useDeleteCos = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (cosId: string) => {
			const response = await soapFetch('DeleteCos', {
				_jsns: 'urn:zimbraAdmin',
				id: cosId
			});

			return response;
		},
		onSuccess: () => {
			createSnackbar({
				key: 'delete-cos-success',
				severity: 'success',
				label: t('cos.deleted_successfully', 'COS deleted successfully'),
				autoHideTimeout: 4000,
				hideButton: true
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.list() });
		},
		onError: (error) => {
			createSnackbar({
				key: 'delete-cos-error',
				severity: 'error',
				label: t('cos.error_deleting', 'Error deleting COS'),
				autoHideTimeout: 4000,
				hideButton: true
			});
		}
	});
};
