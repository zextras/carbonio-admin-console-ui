/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Container, RouteLeavingGuard, Row } from '@zextras/ui-components';
import {
	domainByIdKey,
	flushCache,
	getDomainInformation,
	useAllConfig,
	useUserSettings
} from '@zextras/ui-shared';
import { reduce } from 'lodash-es';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../../types';
import { themeConfigStore } from '../../../../types/domain';
import { TRUE, ZIMBRA_ADMIN_URN } from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { modifyDomain } from '../../../services/modify-domain-service';
import { isValidHexColor } from '../../utility/utils';
import { ThemeConfigs } from '../theme/theme-configs';
import { ResetTheme } from '../theme/theme-reset';
import { DomainFormActions } from './components/domain-form-actions';
import { useDomainMutation } from './hooks/use-domain-mutation';
import { THEME_DEFAULTS, ThemeFormValues,themeSchema } from './schemas/domain-theme-schema';

type ModifyDomainBody = {
	id: string;
	_jsns: string;
	a: Array<{ n: string; _content: string }>;
};

function attributesToThemeConfig(attributes: Attribute[] | undefined): ThemeFormValues {
	if (!attributes || attributes.length === 0) return {};
	return attributes.reduce<ThemeFormValues>((acc, item) => {
		acc[item.n as keyof ThemeFormValues] = item._content as never;
		return acc;
	}, {});
}

const DOMAIN_DEFAULT_THEME_KEYS = [
	'carbonioWebUiDarkMode',
	'carbonioWebUiLoginLogo',
	'carbonioWebUiDarkLoginLogo',
	'carbonioWebUiLoginBackground',
	'carbonioWebUiDarkLoginBackground',
	'carbonioWebUiAppLogo',
	'carbonioWebUiDarkAppLogo',
	'carbonioWebUiFavicon',
	'carbonioWebUiTitle',
	'carbonioWebUiDescription',
	'carbonioAdminUiLoginLogo',
	'carbonioAdminUiDarkLoginLogo',
	'carbonioAdminUiAppLogo',
	'carbonioAdminUiDarkAppLogo',
	'carbonioAdminUiBackground',
	'carbonioAdminUiDarkBackground',
	'carbonioAdminUiFavicon',
	'carbonioAdminUiTitle',
	'carbonioAdminUiDescription',
	'carbonioLogoUrl',
	'carbonioWebUiPrimaryColor',
	'carbonioWebUiDarkPrimaryColor',
	'carbonioWebUILoginURL',
	'carbonioWebUILogoutURL',
	'carbonioAdminUILoginURL',
	'carbonioAdminUILogoutURL',
	'carbonioAdminDocumentationUrl'
] as const;

const DomainTheme: FC = () => {
	const [t] = useTranslation();
	const queryClient = useQueryClient();
	const { domainId } = useParams();
	const userSetting = useUserSettings();

	const { data: configInformation = [] } = useAllConfig();
	const { data: domainWithoutConfig, isLoading: isDomainLoading } = useSelectedDomain(0);
	const domainInformation = domainWithoutConfig?.a;
	const { data: selectedDomain } = useSelectedDomain();
	const domainName = selectedDomain?.name;

	const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;
	const globalTheme = attributesToThemeConfig(configInformation);

	const [isOpenResetDialog, setIsOpenResetDialog] = useState(false);
	const [isValidated, setIsValidated] = useState(true);
	const [prevDomainInfo, setPrevDomainInfo] = useState(domainInformation);
	const [originalValues, setOriginalValues] = useState<ThemeFormValues>(THEME_DEFAULTS);

	const form = useForm({
		defaultValues: THEME_DEFAULTS,
		validators: {
			onChange: themeSchema,
			onSubmit: themeSchema
		},
		onSubmit: async ({ value }) => {
			// Validation check for hex colors
			if (value?.carbonioWebUiPrimaryColor && !isValidHexColor(value.carbonioWebUiPrimaryColor)) {
				return;
			}
			if (
				value?.carbonioWebUiDarkPrimaryColor &&
				!isValidHexColor(value.carbonioWebUiDarkPrimaryColor)
			) {
				return;
			}

			const modifiedKeys = reduce<ThemeFormValues, string[]>(
				value,
				(result, val, key) =>
					val === originalValues[key as keyof ThemeFormValues] ? result : [...result, key],
				[]
			);

			const attributes = modifiedKeys.map((key) => {
				const attrValue = value[key as keyof ThemeFormValues];
				return {
					n: key,
					_content: typeof attrValue === 'boolean' ? String(attrValue).toUpperCase() : (attrValue ?? '')
				};
			});

			await saveMutation({
				id: zimbraId,
				_jsns: ZIMBRA_ADMIN_URN,
				a: attributes
			});
			form.reset(value, { keepDefaultValues: true });
		}
	});

	// Sync form with server data
	if (domainInformation !== prevDomainInfo) {
		setPrevDomainInfo(domainInformation);
		const themeConfig = attributesToThemeConfig(domainInformation);
		setOriginalValues(themeConfig);
		form.reset(themeConfig, { keepDefaultValues: false });
	}

	const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);
	const domainTheme = useSelector(form.store, (state) => state.values);

	const zimbraId = domainWithoutConfig?.id ?? '';

	// Mutation for save
	const { mutate: saveMutation, isPending: isSaving } = useDomainMutation<unknown, ModifyDomainBody>(
		{
			mutationFn: async (body) => {
				const data = await modifyDomain(body);
				if (isGlobalAdmin) {
					flushCache('domain', 'id', body.id);
				}
				const domain = data?.domain?.[0];
				if (domain && domainId) {
					queryClient.setQueryData(domainByIdKey(domainId, 1), domain);
					const res = await getDomainInformation(domain.id, 0);
					const domainData = res?.domain?.[0];
					if (domainData) {
						queryClient.setQueryData(domainByIdKey(domainId, 0), domainData);
					}
				}
				return data;
			}
		}
	);

	// Mutation for reset
	const { mutate: resetMutation, isPending: isResetting } = useDomainMutation<
		unknown,
		ModifyDomainBody
	>({
		mutationFn: async (body) => {
			const data = await modifyDomain(body);
			if (isGlobalAdmin) {
				flushCache('domain', 'id', body.id);
			}
			const domain = data?.domain?.[0];
			if (domain && domainId) {
				queryClient.setQueryData(domainByIdKey(domainId, 1), domain);
				const res = await getDomainInformation(domain.id, 0);
				const domainData = res?.domain?.[0];
				if (domainData) {
					queryClient.setQueryData(domainByIdKey(domainId, 0), domainData);
				}
			}
			return data;
		},
		successMessage: t('label.theme_reset_success', 'Theme has been reset successfully')
	});

	const isPending = isSaving || isResetting;

	// Wrapper for ThemeConfigs compatibility
	const setThemeConfig = (updater: ((prev: themeConfigStore) => themeConfigStore) | themeConfigStore): void => {
		const currentValues = form.store.state.values;
		const newValues = typeof updater === 'function' ? updater(currentValues as themeConfigStore) : updater;
		Object.keys(newValues).forEach((key) => {
			const typedKey = key as keyof ThemeFormValues;
			if (currentValues[typedKey] !== newValues[typedKey]) {
				form.setFieldValue(typedKey, newValues[typedKey] as never);
			}
		});
	};

	const onSave = (): void => {
		form.handleSubmit();
	};

	const onCancel = (): void => {
		form.reset();
	};

	const onResetTheme = (): void => {
		setIsOpenResetDialog(true);
	};

	const closeHandler = (): void => {
		setIsOpenResetDialog(false);
	};

	const onResetHandler = (): void => {
		setIsOpenResetDialog(false);
		const attributes = DOMAIN_DEFAULT_THEME_KEYS.map((key) => ({ n: key, _content: '' }));
		resetMutation({
			id: zimbraId,
			_jsns: ZIMBRA_ADMIN_URN,
			a: attributes
		});
	};

	if (isDomainLoading) {
		return (
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<ds-page-shimmer rows={6} />
			</Container>
		);
	}

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<ds-text as="h2" size="medium" weight="bold" color="gray0">
									{t('label.whitelabel_settings', 'Whitelabel Settings')}
								</ds-text>
							</Row>
							<DomainFormActions
								isDirty={isDirty}
								isPending={isPending}
								isValid={isValidated}
								onCancel={onCancel}
								onSave={onSave}
							/>
						</Row>
					</Container>
					<ds-divider></ds-divider>
				</Row>
				<ThemeConfigs
					themeConfig={domainTheme as themeConfigStore}
					globalTheme={globalTheme as themeConfigStore}
					setThemeConfig={setThemeConfig}
					setIsValidated={setIsValidated}
					onResetTheme={onResetTheme}
				/>
			</Container>
			{isOpenResetDialog && (
				<ResetTheme
					title={t('label.reset_domain_whitelabel_settings', 'Reset {{name}} whitelabel settings', {
						name: domainName
					})}
					isOpenResetDialog={isOpenResetDialog}
					closeHandler={closeHandler}
					onResetHandler={onResetHandler}
				/>
			)}
			<RouteLeavingGuard when={isDirty} onSave={onSave} />
		</Container>
	);
};

export default DomainTheme;
