/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { type SelectItem, useSnackbar } from '@zextras/ui-components';
import { domainByIdKey, replaceHistory, useCosList, useMailstoreServers } from '@zextras/ui-shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { Attribute } from '../../../types';
import { ACTIVE, DOMAINS_ROUTE_ID, GENERAL_SETTINGS, HTTPS, MANAGE } from '../../constants';
import { createGalSyncAccount } from '../../services/create-gal-sync-service';
import { useCreateDomain } from '../../services/use-create-domain';
import { useInitDomainForDelegation } from '../../services/use-init-domain-for-delegation';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import { GbToBytes } from '../utility/utils';
import { CREATE_DOMAIN_DEFAULT_VALUES,GAL_MODE_INTERNAL } from './constants';
import { createDomainSchema } from './schema';
import type { CreateDomainFormApi, CreateDomainFormValues } from './types';

const LAST_STEP = 2;

type CreateDomainSoapResponse = {
	domain?: Array<{ id?: string; name?: string; a?: Array<Attribute> }>;
	Body?: { Fault?: { Reason?: { Text?: string } } };
};

function buildCreateDomainAttributes(value: CreateDomainFormValues): Array<Attribute> {
	const attributes: Array<Attribute> = [
		{ n: 'zimbraNotes', _content: value.zimbraNotes },
		{ n: 'description', _content: value.description },
		{ n: 'zimbraGalMode', _content: GAL_MODE_INTERNAL },
		{ n: 'zimbraGalMaxResults', _content: '' },
		{ n: 'zimbraAuthMech', _content: '' },
		{ n: 'zimbraDomainMaxAccounts', _content: value.zimbraDomainMaxAccounts },
	];
	if (value.domainQuotaGB) {
		attributes.push({
			n: 'zimbraMailDomainQuota',
			_content: GbToBytes(value.domainQuotaGB).toString(),
		});
	}
	attributes.push({ n: 'zimbraDomainStatus', _content: ACTIVE });
	attributes.push({ n: 'zimbraPublicServiceProtocol', _content: HTTPS });
	attributes.push({ n: 'carbonioNotificationFrom', _content: value.carbonioNotificationFrom });
	if (value.zimbraDomainDefaultCOSId !== '') {
		attributes.push({
			n: 'zimbraDomainDefaultCOSId',
			_content: value.zimbraDomainDefaultCOSId,
		});
	}
	value.carbonioNotificationRecipients.forEach((recipient) => {
		attributes.push({ n: 'carbonioNotificationRecipients', _content: recipient.label });
	});
	return attributes;
}

export function useCreateDomainForm() {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const createDomainMutation = useCreateDomain();
	const initDelegationMutation = useInitDomainForDelegation();
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const { data: allMailStoreList = [] } = useMailstoreServers();
	const {
		data: cosData,
		isLoading: isCosListLoading,
		error: cosError,
	} = useCosList({
		searchQuery: '',
		limit: 0,
		offset: 0,
	});

	const mailServerItems: Array<SelectItem> = allMailStoreList.map((item) => ({
		label: item?.name ?? '',
		value: item?.name ?? '',
	}));
	const cosItems: Array<SelectItem> = (cosData?.cos ?? []).map((item) => ({
		label: item.name,
		value: item.id,
	}));

	const form = useForm({
		defaultValues: CREATE_DOMAIN_DEFAULT_VALUES,
		validators: {
			onChange: createDomainSchema,
			onMount: createDomainSchema,
			onSubmit: createDomainSchema,
		},
		onSubmit: async ({ value }) => {
			if (currentStep < LAST_STEP) {
				setCurrentStep((step) => step + 1);
				return;
			}
			setIsSubmitting(true);
			try {
				const data = await createDomainMutation.mutateAsync({
					name: value.domainName,
					attributes: buildCreateDomainAttributes(value),
				});
				const response = data as CreateDomainSoapResponse;
				if (value.mailServer && value.galSyncAccountName !== '' && value.dataSourceName) {
					await createGalSyncAccount(
						value.dataSourceName,
						value.domainName,
						value.mailServer.value,
						[{ by: 'name', _content: `${value.galSyncAccountName}@${value.domainName}` }],
						GAL_MODE_INTERNAL,
						[{ n: 'zimbraDataSourcePollingInterval', _content: '1d' }],
						`_${value.dataSourceName}`,
					);
					if (value.isDomainDelegatedAdmin) {
						initDelegationMutation.mutate({ domain: value.domainName });
					}
					showSuccessSnackBar(value.domainName);
					routeToDomain(response);
				} else {
					const domain = response?.domain?.[0];
					if (domain) {
						showSuccessSnackBar(value.domainName);
						routeToDomain(response);
					} else {
						createSnackbar({
							key: 'error',
							severity: 'error',
							label:
								response?.Body?.Fault?.Reason?.Text ??
								t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true,
						});
					}
				}
			} catch (error) {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label:
						(error as Error | undefined)?.message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true,
				});
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	function showSuccessSnackBar(domainName: string): void {
		createSnackbar({
			key: 'success',
			severity: 'success',
			label: t('label.create_domain_success_msg', {
				domainName,
				defaultValue: '{{domainName}} has been created successfully',
			}),
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true,
		});
	}

	function routeToDomain(resp: CreateDomainSoapResponse): void {
		const domainId = resp?.domain?.[0]?.id;
		if (domainId) {
			const newDomain = {
				a: resp?.domain?.[0]?.a,
				id: domainId,
				name: resp?.domain?.[0]?.name,
			};
			queryClient.setQueryData(domainByIdKey(domainId, 1), newDomain);
			replaceHistory(`/${domainId}/${GENERAL_SETTINGS}`);
		} else {
			replaceHistory(`/`);
		}
	}

	function handleCancel(): void {
		navigate(`/${MANAGE}/${DOMAINS_ROUTE_ID}`);
	}

	function handleBack(): void {
		setCurrentStep((step) => step - 1);
	}

	useEffect(() => {
		if (cosError) {
			const snackbarConfig = generateSnackbarFromError(cosError, t);
			createSnackbar(snackbarConfig);
		}
	}, [cosError, createSnackbar, t]);

	useEffect(() => {
		if (mailServerItems.length > 0 && form.getFieldValue('mailServer') === undefined) {
			form.setFieldValue('mailServer', mailServerItems[0]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mailServerItems]);

	return {
		form: form as CreateDomainFormApi,
		currentStep,
		mailServerItems,
		cosItems,
		isCosListLoading,
		isSubmitting,
		handleCancel,
		handleBack,
	};
}
