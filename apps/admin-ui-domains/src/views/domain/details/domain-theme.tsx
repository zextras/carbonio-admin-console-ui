/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { Container, RouteLeavingGuard, Row } from '@zextras/ui-components';
import {
	domainByIdKey,
	flushCache,
	getDomainInformation,
	useAllConfig,
	useUserSettings
} from '@zextras/ui-shared';
import { cloneDeep, isEqual, reduce } from 'lodash-es';
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

type ModifyDomainBody = {
	id: string;
	_jsns: string;
	a: Array<{ n: string; _content: string }>;
};

function attributesToThemeConfig(attributes: Attribute[] | undefined): themeConfigStore {
	if (!attributes || attributes.length === 0) return {};
	return attributes.reduce<themeConfigStore>((acc, item) => {
		acc[item.n as keyof themeConfigStore] = item._content as never;
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

	// Derived values
	const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;
	const globalTheme = attributesToThemeConfig(configInformation);

	// Local state
	const [domainTheme, setDomainTheme] = useState<themeConfigStore>({});
	const [initialThemeConfig, setInitialThemeConfig] = useState<themeConfigStore>({});
	const [isOpenResetDialog, setIsOpenResetDialog] = useState(false);
	const [isValidated, setIsValidated] = useState(true);

	// Sync with fetched data (conditional state update pattern)
	const [prevDomainInfo, setPrevDomainInfo] = useState(domainInformation);
	if (domainInformation !== prevDomainInfo) {
		setPrevDomainInfo(domainInformation);
		const themeConfig = attributesToThemeConfig(domainInformation);
		setInitialThemeConfig(cloneDeep(themeConfig));
		setDomainTheme(cloneDeep(themeConfig));
	}

	// Derived dirty state
	const isDirty =
		Object.keys(domainTheme).length > 0 && !isEqual(domainTheme, initialThemeConfig);

	const zimbraId = domainTheme.zimbraId ?? domainWithoutConfig?.id ?? '';

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

	const onSave = (): void => {
		if (
			domainTheme?.carbonioWebUiPrimaryColor &&
			!isValidHexColor(domainTheme.carbonioWebUiPrimaryColor)
		) {
			return;
		}
		if (
			domainTheme?.carbonioWebUiDarkPrimaryColor &&
			!isValidHexColor(domainTheme.carbonioWebUiDarkPrimaryColor)
		) {
			return;
		}

		const modifiedKeys = reduce<themeConfigStore, string[]>(
			domainTheme,
			(result, value, key) =>
				isEqual(value, initialThemeConfig[key as keyof themeConfigStore]) ? result : [...result, key],
			[]
		);

		const attributes = modifiedKeys.map((key) => ({
			n: key,
			_content: domainTheme[key as keyof themeConfigStore] ?? ''
		}));

		saveMutation({
			id: zimbraId,
			_jsns: ZIMBRA_ADMIN_URN,
			a: attributes
		});
	};

	const onCancel = (): void => {
		setDomainTheme(cloneDeep(initialThemeConfig));
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
					themeConfig={domainTheme}
					globalTheme={globalTheme}
					setThemeConfig={setDomainTheme}
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
