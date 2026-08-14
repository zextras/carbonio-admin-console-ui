/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey, flushCache, postSoapFetchRequest } from '@zextras/ui-shared';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute } from '../../../../../types/attribute';
import { CosMaxAccountValues } from '../../../../../types/domain';
import { HELPDESK_ADMINS, ZIMBRA_ADMIN_URN } from '../../../../constants';
import { copyCos } from '../../../../services/copy-cos-service';
import { modifyDomain } from '../../../../services/modify-domain-service';

type ModifyDomainResponse = {
	domain?: Array<{ id: string; name: string; [key: string]: unknown }>;
};

type ModifyDomainBody = {
	id: string;
	_jsns: string;
	a: Array<{ n: string; _content: string }>;
};

type UseCosLinkOperationsParams = {
	domainId: string;
	domainName: string;
	cosMaxAccountList: CosMaxAccountValues[];
	isGlobalAdmin: boolean;
	onSuccess?: () => void;
};

type UseCosLinkOperationsReturn = {
	linkCos: (cosId: string, maxAccountValue: string) => Promise<void>;
	duplicateCos: (
		cosId: string,
		maxAccountValue: string,
		cosName: string,
		onLinkCallback: (newCosId: string, maxValue: string) => void
	) => Promise<void>;
	removeCosLink: (cosId: string, maxAccountValue: string) => Promise<void>;
	markAsDefaultCos: (cosId: string) => Promise<void>;
	grantCosRights: (cosId: string) => Promise<void>;
	revokeCosRights: (cosId: string) => Promise<void>;
};

export function useCosLinkOperations({
	domainId,
	domainName,
	cosMaxAccountList,
	isGlobalAdmin,
	onSuccess
}: UseCosLinkOperationsParams): UseCosLinkOperationsReturn {
	const [t] = useTranslation();
	const queryClient = useQueryClient();
	const createSnackbar = useSnackbar();

	const showSuccessSnackbar = useCallback((): void => {
		createSnackbar({
			key: 'success',
			severity: 'success',
			label: t('label.change_save_success_msg', 'The change has been saved successfully'),
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		});
	}, [createSnackbar, t]);

	const showErrorSnackbar = useCallback(
		(error: unknown): void => {
			const message =
				error instanceof Error
					? error.message
					: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: message,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar, t]
	);

	const updateDomainCache = useCallback(
		(data: ModifyDomainResponse): void => {
			if (isGlobalAdmin) {
				flushCache('domain', 'id', domainId);
			}
			const domain = data?.domain?.[0];
			if (domain) {
				queryClient.setQueryData(domainByIdKey(domainId, 1), domain);
			}
		},
		[domainId, isGlobalAdmin, queryClient]
	);

	const grantCosRights = useCallback(
		async (cosId: string): Promise<void> => {
			const target = {
				_content: cosId,
				type: 'cos',
				by: 'id'
			};
			const grantee = {
				by: 'name',
				type: 'grp',
				_content: `${HELPDESK_ADMINS}@${domainName}`
			};

			await postSoapFetchRequest(
				'/service/admin/soap/GrantRightRequest',
				{
					_jsns: ZIMBRA_ADMIN_URN,
					target,
					grantee,
					right: { _content: 'getCos' }
				},
				'GrantRightRequest'
			);
			await postSoapFetchRequest(
				'/service/admin/soap/GrantRightRequest',
				{
					_jsns: ZIMBRA_ADMIN_URN,
					target,
					grantee,
					right: { _content: 'listCos' }
				},
				'GrantRightRequest'
			);
			await postSoapFetchRequest(
				'/service/admin/soap/GrantRightRequest',
				{
					_jsns: ZIMBRA_ADMIN_URN,
					target,
					grantee,
					right: { _content: 'assignCos' }
				},
				'GrantRightRequest'
			);
		},
		[domainName]
	);

	const revokeCosRights = useCallback(
		async (cosId: string): Promise<void> => {
			const target = {
				_content: cosId,
				type: 'cos',
				by: 'id'
			};
			const grantee = {
				by: 'name',
				type: 'grp',
				_content: `${HELPDESK_ADMINS}@${domainName}`
			};

			await postSoapFetchRequest(
				'/service/admin/soap/RevokeRightRequest',
				{
					_jsns: ZIMBRA_ADMIN_URN,
					target,
					grantee,
					right: { _content: 'getCos' }
				},
				'RevokeRightRequest'
			);
			await postSoapFetchRequest(
				'/service/admin/soap/RevokeRightRequest',
				{
					_jsns: ZIMBRA_ADMIN_URN,
					target,
					grantee,
					right: { _content: 'listCos' }
				},
				'RevokeRightRequest'
			);
			await postSoapFetchRequest(
				'/service/admin/soap/RevokeRightRequest',
				{
					_jsns: ZIMBRA_ADMIN_URN,
					target,
					grantee,
					right: { _content: 'assignCos' }
				},
				'RevokeRightRequest'
			);
		},
		[domainName]
	);

	const linkCos = useCallback(
		async (cosId: string, maxAccountValue: string): Promise<void> => {
			if (!cosId || !maxAccountValue) {
				return;
			}

			const attributes: Attribute[] = [];
			const isOverride = cosMaxAccountList.some((item) => item.id === cosId);

			if (isOverride) {
				cosMaxAccountList.forEach((item) => {
					if (item.id !== cosId) {
						attributes.push({
							n: 'zimbraDomainCOSMaxAccounts',
							_content: `${item.id}:${item.value}`
						});
					}
				});
				attributes.push({
					n: 'zimbraDomainCOSMaxAccounts',
					_content: `${cosId}:${maxAccountValue}`
				});
			} else {
				attributes.push({
					n: '+zimbraDomainCOSMaxAccounts',
					_content: `${cosId}:${maxAccountValue}`
				});
			}

			const body: ModifyDomainBody = {
				id: domainId,
				_jsns: ZIMBRA_ADMIN_URN,
				a: attributes
			};

			try {
				const data = await modifyDomain(body);
				showSuccessSnackbar();
				updateDomainCache(data);
				onSuccess?.();

				if (!isOverride) {
					await grantCosRights(cosId);
				}
			} catch (error) {
				showErrorSnackbar(error);
				throw error;
			}
		},
		[
			cosMaxAccountList,
			domainId,
			grantCosRights,
			onSuccess,
			showErrorSnackbar,
			showSuccessSnackbar,
			updateDomainCache
		]
	);

	const duplicateCos = useCallback(
		async (
			cosId: string,
			maxAccountValue: string,
			cosName: string,
			onLinkCallback: (newCosId: string, maxValue: string) => void
		): Promise<void> => {
			if (!cosId || !maxAccountValue) {
				return;
			}
			const newName = `${cosName}.${domainName}`;

			try {
				const data = await copyCos(newName, cosId);
				const cosDetail = data?.cos?.[0];
				if (cosDetail?.id) {
					onLinkCallback(cosDetail.id, maxAccountValue);
				}
			} catch (error) {
				showErrorSnackbar(error);
				throw error;
			}
		},
		[domainName, showErrorSnackbar]
	);

	const removeCosLink = useCallback(
		async (cosId: string, maxAccountValue: string): Promise<void> => {
			if (!cosId || !maxAccountValue) {
				return;
			}

			const body: ModifyDomainBody = {
				id: domainId,
				_jsns: ZIMBRA_ADMIN_URN,
				a: [
					{
						n: '-zimbraDomainCOSMaxAccounts',
						_content: `${cosId}:${maxAccountValue}`
					}
				]
			};

			try {
				const data = await modifyDomain(body);
				showSuccessSnackbar();
				updateDomainCache(data);
				onSuccess?.();
				await revokeCosRights(cosId);
			} catch (error) {
				showErrorSnackbar(error);
				throw error;
			}
		},
		[domainId, onSuccess, revokeCosRights, showErrorSnackbar, showSuccessSnackbar, updateDomainCache]
	);

	const markAsDefaultCos = useCallback(
		async (cosId: string): Promise<void> => {
			if (!cosId) {
				return;
			}

			const body: ModifyDomainBody = {
				id: domainId,
				_jsns: ZIMBRA_ADMIN_URN,
				a: [
					{
						n: 'zimbraDomainDefaultCOSId',
						_content: cosId
					}
				]
			};

			try {
				const data = await modifyDomain(body);
				showSuccessSnackbar();
				updateDomainCache(data);
			} catch (error) {
				showErrorSnackbar(error);
				throw error;
			}
		},
		[domainId, showErrorSnackbar, showSuccessSnackbar, updateDomainCache]
	);

	return {
		linkCos,
		duplicateCos,
		removeCosLink,
		markAsDefaultCos,
		grantCosRights,
		revokeCosRights
	};
}
