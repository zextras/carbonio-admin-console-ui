/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSnackbar } from '@zextras/ui-components';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CONTENT_TYPE_TEXT_PLAIN, SAML_METADATA_JSON_FILE } from '../../../../constants';
import { deleteSamlAttributes } from '../../../../services/delete-saml-attributes';
import { generateSignedCertificate } from '../../../../services/generate-signed-certificate';
import { getSamlConfig } from '../../../../services/get-saml-configurations';
import { importSamlConfig } from '../../../../services/import-saml-configurations';
import { updateSamlAttributes } from '../../../../services/update-saml-attributes';
import { download } from '../../../utility/utils';

export type SamlConfigResponse = Record<string, string> & { error?: string };

type SamlOperationsCallbacks = {
	onConfigChange: (data: SamlConfigResponse) => void;
	onAttributeChange: () => void;
};

type SamlOperations = {
	fetchConfig: () => Promise<void>;
	importConfig: (url: string, allowUnsecure: boolean) => Promise<void>;
	exportConfig: () => Promise<void>;
	generateCertificate: () => Promise<void>;
	deleteConfig: () => Promise<void>;
	updateAttribute: (key: string, value: string, isUpdate: boolean) => Promise<void>;
	removeAttribute: (key: string) => Promise<void>;
	isPending: boolean;
};

export function useSamlOperations(
	domainName: string,
	callbacks: SamlOperationsCallbacks
): SamlOperations {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [isPending, setIsPending] = useState(false);

	const showError = useCallback(
		(error: unknown): void => {
			const message =
				error instanceof Error
					? error.message
					: typeof error === 'object' && error !== null && 'message' in error
						? String((error as { message: unknown }).message)
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
		[t, createSnackbar]
	);

	const showSuccess = useCallback(
		(message: string): void => {
			createSnackbar({
				key: 'success',
				severity: 'success',
				label: message,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar]
	);

	const handleResponse = useCallback(
		(data: SamlConfigResponse, successMessage?: string): boolean => {
			if (data?.error) {
				showError({ message: data.error });
				return false;
			}
			callbacks.onConfigChange(data);
			if (successMessage) {
				showSuccess(successMessage);
			}
			return true;
		},
		[callbacks, showError, showSuccess]
	);

	const fetchConfig = useCallback(async (): Promise<void> => {
		if (!domainName) return;
		setIsPending(true);
		try {
			const data = await getSamlConfig(domainName, true);
			handleResponse(data);
		} catch (error) {
			showError(error);
		} finally {
			setIsPending(false);
		}
	}, [domainName, handleResponse, showError]);

	const importConfig = useCallback(
		async (url: string, allowUnsecure: boolean): Promise<void> => {
			if (!domainName) return;
			setIsPending(true);
			try {
				const data = await importSamlConfig(domainName, url, allowUnsecure);
				handleResponse(
					data,
					t('label.you_have_imported_the_configuration', 'You have imported the configuration')
				);
			} catch (error) {
				showError(error);
			} finally {
				setIsPending(false);
			}
		},
		[domainName, handleResponse, showError, t]
	);

	const exportConfig = useCallback(async (): Promise<void> => {
		if (!domainName) return;
		setIsPending(true);
		try {
			const data = await getSamlConfig(domainName);
			if (data?.error) {
				showError({ message: data.error });
			} else {
				download(JSON.stringify(data), SAML_METADATA_JSON_FILE, CONTENT_TYPE_TEXT_PLAIN);
				showSuccess(
					t('label.you_have_exported_the_configuration', 'You have exported the configuration')
				);
			}
		} catch (error) {
			showError(error);
		} finally {
			setIsPending(false);
		}
	}, [domainName, showError, showSuccess, t]);

	const generateCertificate = useCallback(async (): Promise<void> => {
		if (!domainName) return;
		setIsPending(true);
		try {
			const data = await generateSignedCertificate(domainName);
			handleResponse(
				data,
				t('label.you_have_generated_the_sp_certificate', 'You have generated the SP Certificate')
			);
		} catch (error) {
			showError(error);
		} finally {
			setIsPending(false);
		}
	}, [domainName, handleResponse, showError, t]);

	const deleteConfig = useCallback(async (): Promise<void> => {
		if (!domainName) return;
		setIsPending(true);
		try {
			const data = await deleteSamlAttributes(domainName);
			handleResponse(
				data,
				t('label.you_have_deleted_the_configuration', 'You have deleted the configuration')
			);
		} catch (error) {
			showError(error);
		} finally {
			setIsPending(false);
		}
	}, [domainName, handleResponse, showError, t]);

	const updateAttribute = useCallback(
		async (key: string, value: string, isUpdate: boolean): Promise<void> => {
			if (!domainName || !key) return;
			setIsPending(true);
			try {
				const body = { [key]: value } as unknown as JSON;
				const data = await updateSamlAttributes(domainName, body);
				const success = handleResponse(
					data,
					isUpdate
						? t('label.you_have_updated_attribute', {
								attributeName: key,
								defaultValue: 'You have updated the {{ attributeName }} attribute'
							})
						: t('label.you_have_added_attribute', {
								attributeName: key,
								defaultValue: 'You have added the {{ attributeName }} attribute'
							})
				);
				if (success) {
					callbacks.onAttributeChange();
				}
			} catch (error) {
				showError(error);
			} finally {
				setIsPending(false);
			}
		},
		[domainName, handleResponse, callbacks, showError, t]
	);

	const removeAttribute = useCallback(
		async (key: string): Promise<void> => {
			if (!domainName || !key) return;
			setIsPending(true);
			try {
				const data = await deleteSamlAttributes(domainName, key);
				const success = handleResponse(
					data,
					t('label.you_have_removed_attribute', {
						attributeName: key,
						defaultValue: 'You have removed the {{ attributeName }} attribute'
					})
				);
				if (success) {
					callbacks.onAttributeChange();
				}
			} catch (error) {
				showError(error);
			} finally {
				setIsPending(false);
			}
		},
		[domainName, handleResponse, callbacks, showError, t]
	);

	return {
		fetchConfig,
		importConfig,
		exportConfig,
		generateCertificate,
		deleteConfig,
		updateAttribute,
		removeAttribute,
		isPending
	};
}
