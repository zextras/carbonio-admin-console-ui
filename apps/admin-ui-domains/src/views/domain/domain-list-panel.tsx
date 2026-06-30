/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, DropDownInput, ListItems, type ListItemType, ListPanelItem, Padding, Row, useSnackbar, } from '@zextras/ui-components';
import { getAllRights, replaceHistory, useAllConfig, useBackupServers, useCurrentUserRights, useIsAdvanced, useTotalQuotaActive } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router';

import { DomainResponse } from '../../../types';
import {
	ACCOUNTS,
	ACTIVE_SYNC,
	AUTHENTICATION,
	BOOLEAN_FALSE,
	CONFIG,
	DELEGATES_DOMAIN_ADMINS,
	DISCLAIMER,
	DISTRIBUTION_LIST,
	DOMAINS_ROUTE_ID,
	FALSE,
	GAL,
	GENERAL_SETTINGS,
	GLOBAL_2FA_ROUTE,
	GLOBAL_ACTIVE_SYNC_ROUTE,
	GLOBAL_ADMINISTRATORS,
	GLOBAL_DOMAIN_ROUTE,
	GLOBAL_QUARANTINE_ROUTE,
	GLOBAL_ROUTE,
	GLOBAL_SETTINGS_ROUTE,
	GLOBAL_WHITELABEL_SETTINGS,
	IS_DETAIL_LIST_EXPANDED,
	IS_MANAGE_LIST_EXPANDED,
	MAILBOX_QUOTA,
	MANAGE_APP_ID,
	MAX_DOMAIN_DISPLAY,
	RESOURCES,
	RESTORE_ACCOUNT,
	SAML,
	SECURITY_GROUP,
	TWO_FACTOR_AUTHENTICATION,
	VIRTUAL_HOSTS,
	WHITELABEL_SETTINGS,
	ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
} from '../../constants';
import { getDomainList } from '../../services/search-domain-service';
import { useDomainStore } from '../../store/store';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import GlobalListPanel from './global-list-panel';

const DOMAINS_BASE = `/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`;

const DomainListPanel: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const locationService = useLocation();
	const [isDomainListExpand, setIsDomainListExpand] = useState(false);
	const [searchDomainName, setSearchDomainName] = useState('');
	const [domainList, setDomainList] = useState<
		{
			name: string;
			id: string;
			a: { n: string; _content: string }[];
		}[]
	>([]);
	const domainInformation = useDomainStore((state) => state.domain);
	const setDomain = useDomainStore((state) => state.setDomain);
	const [isDetailListExpanded, setIsDetailListExpanded] = useState(true);
	const [isManageListExpanded, setIsManageListExpanded] = useState(true);

	const isAdvanced = useIsAdvanced();
	const isTotalQuotaActive = useTotalQuotaActive();
	const { data: backupData } = useBackupServers({
		enabled: isAdvanced,
	});
	const [manageOptions, setListItemType] = useState<ListItemType[]>([]);
	const [isShowGlobalConfig, setIsShowGlobalConfig] = useState<boolean>(false);
	const { data: rights } = useCurrentUserRights();
	const [isShowError, setIsShowError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { data: globalConfigInformation = [] } = useAllConfig();
	const [is2FAAvailable, setIs2FAAvailable] = useState(true);

	const globalMatch =
		matchPath(`${DOMAINS_BASE}/${GLOBAL_ROUTE}/*`, locationService.pathname) ??
		matchPath(`${DOMAINS_BASE}/${GLOBAL_ROUTE}`, locationService.pathname);
	const isGlobalRoute = !!globalMatch;
	const domainMatch = isGlobalRoute
		? null
		: matchPath(`${DOMAINS_BASE}/:domainId/:operation`, locationService.pathname);
	const selectedDomainId = domainMatch?.params.domainId ?? '';
	const isDomainSelect = !!selectedDomainId;
	const globalSub = globalMatch
		? ((globalMatch.params as Record<string, string | undefined>)['*'] ?? '')
		: '';
	const globalView = globalSub ? `${GLOBAL_ROUTE}/${globalSub}` : GLOBAL_SETTINGS_ROUTE;
	const domainView = isGlobalRoute
		? globalView
		: (domainMatch?.params.operation ?? GLOBAL_DOMAIN_ROUTE);

	useEffect(() => {
		const isAvail2Fa = domainInformation?.a?.find((item) => item?.n === 'zimbraAuthMech');
		setIs2FAAvailable(isAvail2Fa === undefined);
	}, [domainInformation]);

	const loadingComponent = [
		{
			customComponent: (
				<Container>
					<ds-spinner></ds-spinner>
				</Container>
			),
		},
	];

	useEffect(() => {
		if (rights && rights.length > 0) {
			const allRights = getAllRights(rights, CONFIG);
			if (allRights && allRights.length > 0) {
				const right = allRights[0];
				if (
					right?.all &&
					Array.isArray(right?.all) &&
					right?.all.length > 0 &&
					right?.all[0].getAttrs &&
					right?.all[0].getAttrs.length > 0
				) {
					right?.all[0].getAttrs.forEach((item: Record<string, unknown>) => {
						if (item?.all && item?.all === true) {
							setIsShowGlobalConfig(true);
						}
					});
				}
			}
		}
	}, [rights]);

	const getDomainLists = useCallback(
		(domainName: string): void => {
			setIsLoading(true);
			getDomainList(domainName, 0)
				.then((data) => {
					const searchResponse: DomainResponse = data;
					if (!!searchResponse && searchResponse?.searchTotal > 0) {
						setDomainList(searchResponse?.domain);
						setIsLoading(false);
					} else if (domainName !== '' && searchResponse?.searchTotal === 0) {
						setIsShowError(true);
						setDomainList([]);
						setIsLoading(false);
					} else {
						setDomainList([]);
						setIsLoading(false);
					}
				})
				.catch((error) => {
					const snackbarConfig = generateSnackbarFromError(error, t);
					createSnackbar(snackbarConfig);
					setIsLoading(false);
				});
		},
		[createSnackbar, t],
	);

	useEffect(() => {
		getDomainLists('');
	}, [getDomainLists]);

	useMemo(() => {
		if (domainInformation?.name) {
			setSearchDomainName(domainInformation?.name);
			setIsDomainListExpand(false);
		}
	}, [domainInformation?.id, domainInformation?.name]);

	useEffect(() => {
		if (
			locationService.pathname &&
			locationService.pathname === DOMAINS_BASE
		) {
			setDomainList([]);
			setSearchDomainName('');
			setIsDomainListExpand(false);
			setDomain({});
		}
	}, [locationService, setDomain]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchDomainCall = useCallback(
		debounce((domain) => {
			getDomainLists(domain);
		}, 700),
		[debounce],
	);

	useEffect(() => {
		if (!isDomainSelect) {
			searchDomainCall(searchDomainName);
		}
	}, [searchDomainName, isDomainSelect, searchDomainCall]);

	const selectedDomain = useCallback(
		(domain: { name: string; id: string; a: { n: string; _content: string }[] }) => {
			setSearchDomainName(domain?.name);
			setIsDomainListExpand(false);
			replaceHistory(`/${domain?.id}/${GENERAL_SETTINGS}`);
		},
		[],
	);

	const navigateToView = useCallback(
		(view: string) => {
			if (view.startsWith(`${GLOBAL_ROUTE}/`)) {
				replaceHistory(`/${view}`);
			} else if (isDomainSelect && selectedDomainId) {
				replaceHistory(`/${selectedDomainId}/${view}`);
			}
		},
		[isDomainSelect, selectedDomainId],
	);

	const isDisclaimerEnable = useMemo(
		() =>
			globalConfigInformation.find(
				(item) => item?.n === ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
			)?._content,
		[globalConfigInformation],
	);

	const detailOptions = useMemo(
		() => [
			{
				id: GENERAL_SETTINGS,
				name: t('label.general_settings', 'General Settings'),
				isSelected: isDomainSelect,
			},
			{
				id: GAL,
				name: t('label.global_address_list', 'Global Address List'),
				isSelected: isDomainSelect,
			},
			{
				id: AUTHENTICATION,
				name: t('label.authentication', 'Authentication'),
				isSelected: isDomainSelect,
			},
			{
				id: VIRTUAL_HOSTS,
				name: t('label.virtual_hosts_and_certificates', 'Virtual Hosts & Certificate'),
				isSelected: isDomainSelect,
			},
			{
				id: MAILBOX_QUOTA,
				name: t('label.mailbox_quota', 'Mailbox Quota'),
				isSelected: isDomainSelect,
			},
			{
				id: WHITELABEL_SETTINGS,
				name: t('label.whitelabel_settings', 'Whitelabel Settings'),
				isSelected: isDomainSelect,
			},
			{
				id: TWO_FACTOR_AUTHENTICATION,
				name: t('label.2-factor-authentication', '2-Factor-Authentication'),
				isSelected: isDomainSelect && is2FAAvailable,
			},
			{
				id: SAML,
				name: t('label.saml', 'SAML'),
				isSelected: isDomainSelect,
			},
			{
				id: DISCLAIMER,
				name: t('label.disclaimer', 'Disclaimer'),
				isSelected: isDisclaimerEnable === FALSE ? BOOLEAN_FALSE : isDomainSelect,
			},
		],
		[t, isDomainSelect, is2FAAvailable, isDisclaimerEnable],
	);

	const allListItemType = useMemo(
		() => [
			{
				id: ACCOUNTS,
				name: t('label.accounts', 'Accounts'),
				isSelected: isDomainSelect,
			},
			{
				id: DELEGATES_DOMAIN_ADMINS,
				name: t('label.delegates_domain_admins', 'Delegated Domain Admins'),
				isSelected: isDomainSelect,
			},
			{
				id: DISTRIBUTION_LIST,
				name: t('label.distribution_list', 'Distribution List'),
				isSelected: isDomainSelect,
			},
			{
				id: RESOURCES,
				name: t('label.resources', 'Resources'),
				isSelected: isDomainSelect,
			},
			{
				id: ACTIVE_SYNC,
				name: t('label.active_sync', 'ActiveSync'),
				isSelected: isDomainSelect,
			},
			{
				id: RESTORE_ACCOUNT,
				name: t('label.restore_account', 'Restore Account'),
				isSelected: isDomainSelect,
			},
		],
		[t, isDomainSelect],
	);

	const globalOptionItems = useMemo(
		() => [
			{
				id: GLOBAL_SETTINGS_ROUTE,
				name: t('label.settings', 'Settings'),
				isSelected: true,
			},
			{
				id: GLOBAL_ADMINISTRATORS,
				name: t('label.administrators', 'Administrators'),
				isSelected: true,
			},
			{
				id: GLOBAL_WHITELABEL_SETTINGS,
				name: t('label.whitelabel_settings', 'Whitelabel Settings'),
				isSelected: true,
			},
			{
				id: GLOBAL_DOMAIN_ROUTE,
				name: t('label.domains', 'Domains'),
				isSelected: true,
			},
			{
				id: GLOBAL_2FA_ROUTE,
				name: t('label.2fa', '2-Factor-Authentication'),
				isSelected: true,
			},
			{
				id: GLOBAL_QUARANTINE_ROUTE,
				name: t('label.quarantine', 'Quarantine'),
				isSelected: true,
			},
			{
				id: GLOBAL_ACTIVE_SYNC_ROUTE,
				name: t('label.active_sync', 'ActiveSync'),
				isSelected: true,
			},
		],
		[t],
	);

	const manageItems = useMemo(
		() =>
			!isAdvanced
				? allListItemType.filter(
						(item: ListItemType) =>
							item?.id !== RESTORE_ACCOUNT &&
							item?.id !== ACTIVE_SYNC &&
							item?.id !== DELEGATES_DOMAIN_ADMINS &&
							item?.id !== SECURITY_GROUP,
					)
				: allListItemType,
		[allListItemType, isAdvanced],
	);

	const detailItems = useMemo(
		() =>
			detailOptions.filter((item: ListItemType) => {
				if (!isAdvanced) {
					if (
						item?.id === WHITELABEL_SETTINGS ||
						item?.id === SAML ||
						item?.id === TWO_FACTOR_AUTHENTICATION
					) {
						return false;
					}
				}
				if (isTotalQuotaActive && item?.id === MAILBOX_QUOTA) {
					return false;
				}
				return true;
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[detailOptions, isAdvanced, is2FAAvailable, isTotalQuotaActive],
	);

	const globalOptionsItems = useMemo(
		() =>
			!isAdvanced
				? globalOptionItems.filter(
						(item: ListItemType) =>
							item?.id !== GLOBAL_WHITELABEL_SETTINGS &&
							item?.id !== GLOBAL_2FA_ROUTE &&
							item.id !== GLOBAL_ACTIVE_SYNC_ROUTE,
					)
				: globalOptionItems,
		[globalOptionItems, isAdvanced],
	);

	useEffect(() => {
		if (backupData && !backupData?.backupModuleEnable && !backupData?.isBackupModuleLicensed) {
			const options = manageItems.filter((item: ListItemType) => item?.id !== RESTORE_ACCOUNT);
			setListItemType(options);
		}
	}, [manageItems, isDomainSelect, backupData]);

	useMemo(() => {
		setListItemType(
			manageItems.map((item: ListItemType) => {
				item.isSelected = isDomainSelect;
				return item;
			}),
		);
	}, [isDomainSelect, manageItems]);

	const toggleDetailView = (): void => {
		if (isDetailListExpanded) {
			setIsDetailListExpanded(false);
			localStorage.setItem(IS_DETAIL_LIST_EXPANDED, 'false');
		} else {
			setIsDetailListExpanded(true);
			localStorage.removeItem(IS_DETAIL_LIST_EXPANDED);
		}
	};

	const toggleManageView = (): void => {
		if (isManageListExpanded) {
			setIsManageListExpanded(false);
			localStorage.setItem(IS_MANAGE_LIST_EXPANDED, 'false');
		} else {
			setIsManageListExpanded(true);
			localStorage.removeItem(IS_MANAGE_LIST_EXPANDED);
		}
	};

	const customIconDetail = {
		onClick: (): void => {
			setIsShowError(false);
			if (searchDomainName === '') {
				setIsDomainListExpand(!isDomainListExpand);
			} else {
				setSearchDomainName('');
				replaceHistory(`/${GLOBAL_DOMAIN_ROUTE}`);
			}
		},
		size: '1.25rem',
		icon: searchDomainName === '' ? ('GlobeOutline' as const) : ('CloseOutline' as const),
	};

	const items =
		domainList.length > MAX_DOMAIN_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row mainAlignment="flex-start">
									<Padding horizontal="small">
										<ds-icon
											style={{ width: '1.25rem', height: '1.25rem' }}
											icon="InfoOutline"
										></ds-icon>
									</Padding>
								</Row>
								<Row
									mainAlignment="flex-start"
									width="100%"
									padding={{
										all: 'small',
									}}
								>
									<ds-text as="p" overflow="break-word">
										{t(
											'many_domain_info_msg',
											'So many domains! Which one would you like to see? Start typing to filter.',
										)}
									</ds-text>
								</Row>
							</>
						),
					},
				]
			: domainList.map(
					(domain: { name: string; id: string; a: { n: string; _content: string }[] }) => ({
						id: domain.id,
						label: domain.name,
						customComponent: (
							<Row
								style={{
									display: 'block',
									textAlign: 'left',
									height: 'inherit',
									padding: '0.188rem',
									width: 'inherit',
								}}
								onClick={(): void => {
									setIsShowError(false);
									selectedDomain(domain);
								}}
							>
								{domain?.name}
							</Row>
						),
					}),
				);

	useEffect(() => {
		const storedDetailListViewValue = localStorage.getItem(IS_DETAIL_LIST_EXPANDED);
		if (storedDetailListViewValue === 'false') {
			setIsDetailListExpanded(false);
		} else {
			setIsDetailListExpanded(true);
		}
		const storedManageListViewValue = localStorage.getItem(IS_MANAGE_LIST_EXPANDED);
		if (storedManageListViewValue === 'false') {
			setIsManageListExpanded(false);
		} else {
			setIsManageListExpanded(true);
		}
		if (locationService.pathname === DOMAINS_BASE) {
			replaceHistory(`/${GLOBAL_DOMAIN_ROUTE}`);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '0.063rem solid #FFFFFF' }}
		>
			{isShowGlobalConfig && globalOptionsItems.length > 0 && (
				<GlobalListPanel
					globalOptionItems={globalOptionItems}
					selectedOperationItem={domainView}
					setSelectedOperationItem={navigateToView}
				/>
			)}

			<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
				<DropDownInput
					items={isLoading ? loadingComponent : items}
					inputLabel={
						isDomainSelect
							? t('domain.i_want_to_see_this_domain', 'I want to see this domain')
							: t('domain.type_the exact_domain_name', 'Type the exact domain name')
					}
					hasError={isShowError}
					onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
						setSearchDomainName(ev.target.value);
						setIsShowError(false);
					}}
					inputValue={searchDomainName}
					isCustomIcon
					customIconDetail={customIconDetail}
				/>
			</Row>
			{isShowError && (
				<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
					<Padding top="large" left="small">
						<ds-text as="small" size="extrasmall" weight="regular" color="error">
							{t(
								'label.not_found_check_the_text_and_try_again',
								'Not found - check the text and try again',
							)}
						</ds-text>
					</Padding>
				</Container>
			)}
			<ListPanelItem
				title={t('domain.manage', 'Manage')}
				isListExpanded={isManageListExpanded}
				setToggleView={toggleManageView}
			/>
			{isManageListExpanded && (
				<ListItems
					items={manageOptions}
					selectedOperationItem={domainView}
					setSelectedOperationItem={navigateToView}
				/>
			)}
			<ListPanelItem
				title={t('label.details', 'Details')}
				isListExpanded={isDetailListExpanded}
				setToggleView={toggleDetailView}
			/>
			{isDetailListExpanded && (
				<ListItems
					items={detailItems}
					selectedOperationItem={domainView}
					setSelectedOperationItem={navigateToView}
				/>
			)}
		</Container>
	);
};
export default DomainListPanel;
