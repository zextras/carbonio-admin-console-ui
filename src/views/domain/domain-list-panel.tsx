/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState, useMemo } from 'react';
import { Container, Icon, Row, Padding, Text } from '@zextras/carbonio-design-system';

import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import { getDomainList } from '../../services/search-domain-service';
import {
	ACCOUNTS,
	ACTIVE_SYNC,
	AUTHENTICATION,
	DOMAINS_ROUTE_ID,
	GAL,
	GENERAL_SETTINGS,
	GLOBAL_THEME_ROUTE,
	MAILBOX_QUOTA,
	MAILING_LIST,
	ACL_LIST,
	MANAGE_APP_ID,
	MAX_DOMAIN_DISPLAY,
	RESTORE_ACCOUNT,
	THEME,
	VIRTUAL_HOSTS,
	SAML,
	CONFIG,
	GLOBAL_DOMAIN_ROUTE,
	GLOBAL_2FA_ROUTE,
	TWO_FACTOR_AUTHENTICATION,
	DELEGATES,
	SECURITY_GROUP,
	GLOBAL_ROUTE,
	BACKUP_BASIC
} from '../../constants';
import { useDomainStore } from '../../store/domain/store';
import ListPanelItem from '../list/list-panel-item';
import ListItems from '../list/list-items';
import { useBackupModuleStore } from '../../store/backup-module/store';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';
import GlobalListPanel from './global-list-panel';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import { useModuleLicenseStore } from '../../store/module-license/store';
import { Right, useRightsStore } from '../../store/rights/store';
import { getAllRights } from '../utility/utils';
import DropDownInput from '../components/dropDownInput';
import OverlayDivision from '../components/overlayDivision';
import { DomainResponse } from '../../../types';
import { useConfigStore } from '../../store/config/store';

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;
const ovelayStyle = styled(Container)`
	width: 20rem;
	right: 0;
	bottom: 0;
	height: 8rem;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
`;

interface ManageOptions {
	[key: string]: string | boolean;
}

const DomainListPanel: FC = () => {
	const [t] = useTranslation();
	const locationService = useLocation();
	const { userId } = useConfigStore((state) => state);
	const matomo = useMemo(() => new MatomoTracker(userId), [userId]);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [isDomainListExpand, setIsDomainListExpand] = useState(false);
	const [searchDomainName, setSearchDomainName] = useState('');
	const [domainId, setDomainId] = useState('');
	const [domainList, setDomainList] = useState<
		{
			name: string;
			id: string;
			a: { n: string; _content: string }[];
		}[]
	>([]);
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const setDomain = useDomainStore((state) => state.setDomain);
	const domainInformation = useDomainStore((state) => state.domain);
	const domainView = useDomainStore((state) => state.domainView);
	const setDomainView = useDomainStore((state) => state.setDomainView);
	const [isDetailListExpanded, setIsDetailListExpanded] = useState(true);
	const [isManageListExpanded, setIsManageListExpanded] = useState(true);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const moduleLicense = useModuleLicenseStore((state) => state.moduleLicense);
	const [manageOptions, setManageOptions] = useState<ManageOptions[]>([]);
	const [isBackupModuleLicensed, setIsBackupModuleLicensed] = useState<boolean>(false);
	const [isShowGlobalConfig, setIsShowGlobalConfig] = useState<boolean>(false);
	const rights = useRightsStore((state) => state.rights);
	const [isShowError, setIsShowError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const loadingComponent = [
		{
			customComponent: (
				<Container>
					<OverlayDivision ovelayStyle={ovelayStyle} />
				</Container>
			)
		}
	];

	useEffect(() => {
		if (rights && rights.length > 0) {
			const allRights = getAllRights(rights, CONFIG);
			if (allRights && allRights.length > 0) {
				const right: Right = allRights[0];
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

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${DOMAINS_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	useEffect(() => {
		if (!domainInformation?.name) {
			setSearchDomainName('');
		}
	}, [domainInformation]);

	const getBackupModuleEnable = useBackupModuleStore((state) => state.backupModuleEnable);
	const getDomainLists = useCallback((domainName: string): void => {
		setIsLoading(true);
		getDomainList(domainName, 0).then((data) => {
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
		});
	}, []);

	useEffect(() => {
		getDomainLists('');
	}, [getDomainLists]);

	useMemo(() => {
		if (domainInformation?.name) {
			setSearchDomainName(domainInformation?.name);
			setIsDomainSelect(true);
			setIsDomainListExpand(false);

			if (domainInformation?.id) {
				setDomainId(domainInformation?.id);
			}
		} else {
			setIsDomainSelect(false);
		}
	}, [domainInformation?.id, domainInformation?.name]);

	useMemo(() => {
		if (domainView === '') {
			const operationItem = locationService?.pathname.split('/').pop();
			setDomainView(operationItem || '');
		}
	}, [domainView, locationService?.pathname, setDomainView]);

	useEffect(() => {
		if (
			locationService.pathname &&
			locationService.pathname === `/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`
		) {
			setDomainList([]);
			setIsDomainSelect(false);
			setSearchDomainName('');
			setIsDomainListExpand(false);
			setDomainView('');
			setDomainId('');
			setDomain({});
		}
	}, [locationService, setDomain, setDomainView]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchDomainCall = useCallback(
		debounce((domain) => {
			getDomainLists(domain);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (!isDomainSelect) {
			searchDomainCall(searchDomainName);
		}
	}, [searchDomainName, isDomainSelect, searchDomainCall]);

	const selectedDomain = useCallback(
		(domain: { name: string; id: string; a: { n: string; _content: string }[] }) => {
			setIsDomainSelect(true);
			setSearchDomainName(domain?.name);
			setIsDomainListExpand(false);
			setDomainId(domain?.id);
			setDomainView(GENERAL_SETTINGS);
		},
		[setDomainView]
	);

	useEffect(() => {
		if (isDomainSelect && domainId) {
			if (domainView) {
				globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${domainView}`);
				if (domainView === GLOBAL_ROUTE) {
					replaceHistory(`/${domainView}`);
				} else if (domainView === GLOBAL_THEME_ROUTE) {
					replaceHistory(`/${domainView}`);
				} else if (domainView === GLOBAL_2FA_ROUTE) {
					replaceHistory(`/${domainView}`);
				} else if (domainView === GLOBAL_DOMAIN_ROUTE) {
					replaceHistory(`/${domainView}`);
				} else {
					replaceHistory(`/${domainId}/${domainView}`);
				}
			} else {
				globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${domainView}`);
				replaceHistory(`/${domainId}/${GENERAL_SETTINGS}`);
			}
		} else if (domainView) {
			globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${domainView}`);
			replaceHistory(`/${domainView}`);
		}
	}, [isDomainSelect, domainId, domainView, matomo, globalCarbonioSendAnalytics]);

	const detailOptions = useMemo(
		() => [
			{
				id: GENERAL_SETTINGS,
				name: t('label.general_settings', 'General Settings'),
				isSelected: isDomainSelect
			},
			{
				id: GAL,
				name: t('label.global_address_list', 'Global Address List'),
				isSelected: isDomainSelect
			},
			{
				id: AUTHENTICATION,
				name: t('label.authentication', 'Authentication'),
				isSelected: isDomainSelect
			},
			{
				id: VIRTUAL_HOSTS,
				name: t('label.virtual_hosts_and_certificates', 'Virtual Hosts & Certificate'),
				isSelected: isDomainSelect
			},
			{
				id: MAILBOX_QUOTA,
				name: t('label.mailbox_quota', 'Mailbox Quota'),
				isSelected: isDomainSelect
			},
			{
				id: THEME,
				name: t('label.theme', 'Theme'),
				isSelected: isDomainSelect
			},
			{
				id: TWO_FACTOR_AUTHENTICATION,
				name: t('label.2-factor-authentication', '2-Factor-Authentication'),
				isSelected: isDomainSelect
			},
			{
				id: SAML,
				name: t('label.saml', 'SAML'),
				isSelected: isDomainSelect
			}
		],
		[t, isDomainSelect]
	);

	const allManageOptions = useMemo(
		() => [
			{
				id: ACCOUNTS,
				name: t('label.accounts', 'Accounts'),
				isSelected: isDomainSelect
			},
			// TODO: uncomment once we have the delgates feature completely from backend
			// {
			// 	id: DELEGATES,
			// 	name: t('label.delegates_title', 'Delegates'),
			// 	isSelected: isDomainSelect
			// },
			{
				id: MAILING_LIST,
				name: t('label.mailing_list', 'Mailing List'),
				isSelected: isDomainSelect
			},
			{
				id: SECURITY_GROUP,
				name: t('label.security_group', 'Security Groups'),
				isSelected: isDomainSelect
			},
			// AC622 - Hide resources from AdminUI until they are not managed by the webUI
			// {
			// 	id: RESOURCES,
			// 	name: t('label.resources', 'Resources'),
			// 	isSelected: isDomainSelect
			// },
			{
				id: ACTIVE_SYNC,
				name: t('label.active_sync', 'ActiveSync'),
				isSelected: isDomainSelect
			},
			{
				id: RESTORE_ACCOUNT,
				name: t('label.restore_account', 'Restore Account'),
				isSelected: isDomainSelect
			}
		],
		[t, isDomainSelect]
	);

	const globalOptionItems = useMemo(
		() => [
			{
				id: GLOBAL_ROUTE,
				name: t('label.global', 'Global'),
				isSelected: true
			},
			{
				id: GLOBAL_THEME_ROUTE,
				name: t('label.theme', 'Theme'),
				isSelected: true
			},
			{
				id: GLOBAL_DOMAIN_ROUTE,
				name: t('label.domains', 'Domains'),
				isSelected: true
			},
			{
				id: GLOBAL_2FA_ROUTE,
				name: t('label.2fa', '2-Factor-Authentication'),
				isSelected: true
			}
		],
		[t]
	);

	const manageItems = useMemo(
		() =>
			!isAdvanced
				? allManageOptions.filter(
						(item: ManageOptions) =>
							item?.id !== RESTORE_ACCOUNT && item?.id !== ACTIVE_SYNC && item?.id !== DELEGATES
				  )
				: allManageOptions,
		[allManageOptions, isAdvanced]
	);

	const detailItems = useMemo(
		() =>
			!isAdvanced
				? detailOptions.filter(
						(item: ManageOptions) =>
							item?.id !== THEME && item?.id !== SAML && item?.id !== TWO_FACTOR_AUTHENTICATION
				  )
				: detailOptions,
		[detailOptions, isAdvanced]
	);

	const globalOptionsItems = useMemo(
		() =>
			!isAdvanced
				? globalOptionItems.filter(
						(item: ManageOptions) =>
							item?.id !== GLOBAL_THEME_ROUTE && item?.id !== GLOBAL_2FA_ROUTE
				  )
				: globalOptionItems,
		[globalOptionItems, isAdvanced]
	);

	useEffect(() => {
		if (!getBackupModuleEnable && !isBackupModuleLicensed) {
			const options = manageItems.filter((item: ManageOptions) => item?.id !== RESTORE_ACCOUNT);
			setManageOptions(options);
		}
	}, [getBackupModuleEnable, manageItems, isBackupModuleLicensed, isDomainSelect]);

	useMemo(() => {
		setManageOptions(
			manageItems.map((item: ManageOptions) => {
				// eslint-disable-next-line no-param-reassign
				item.isSelected = isDomainSelect;
				return item;
			})
		);
	}, [isDomainSelect, manageItems]);

	useEffect(() => {
		if (moduleLicense && moduleLicense.length > 0) {
			const backupModule = moduleLicense.filter(
				(item: Record<string, string | number | boolean>) => item?.name === BACKUP_BASIC
			);
			if (backupModule && backupModule[0] && backupModule[0]?.enabled) {
				setIsBackupModuleLicensed(true);
			}
		}
	}, [moduleLicense]);

	const toggleDetailView = (): void => {
		setIsDetailListExpanded(!isDetailListExpanded);
	};

	const toggleManageView = (): void => {
		setIsManageListExpanded(!isManageListExpanded);
	};

	const customIconDetail = {
		onClick: (): void => {
			setIsShowError(false);
			if (searchDomainName === '') {
				setIsDomainListExpand(!isDomainListExpand);
			} else {
				setSearchDomainName('');
				setIsDomainSelect(false);
			}
		},
		style: {
			width: '1.25rem',
			height: '1.25rem'
		},
		icon: searchDomainName === '' ? 'GlobeOutline' : 'CloseOutline'
	};

	const items =
		domainList.length > MAX_DOMAIN_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
									mainAlignment="flex-start"
									width="100%"
									padding={{
										all: 'small'
									}}
								>
									<Text overflow="break-word">
										{t(
											'many_domain_info_msg',
											'So many domains! Which one would you like to see? Start typing to filter.'
										)}
									</Text>
								</Row>
							</>
						)
					}
			  ]
			: domainList.map(
					(
						domain: {
							name: string;
							id: string;
							a: { n: string; _content: string }[];
						},
						index
					) => ({
						id: domain.id,
						label: domain.name,
						customComponent: (
							<SelectItem
								style={{
									display: 'block',
									textAlign: 'left',
									height: 'inherit',
									padding: '0.188rem',
									width: 'inherit'
								}}
								onClick={(): void => {
									setIsShowError(false);
									selectedDomain(domain);
								}}
							>
								{domain?.name}
							</SelectItem>
						)
					})
			  );

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
					globalOptionItems={globalOptionsItems}
					selectedOperationItem={domainView}
					setSelectedOperationItem={setDomainView}
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
						setIsDomainSelect(false);
						setIsShowError(false);
						setSearchDomainName(ev.target.value);
					}}
					inputValue={searchDomainName}
					isCustomIcon
					customIconDetail={customIconDetail}
				/>
			</Row>
			{isShowError && (
				<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
					<Padding top="large" left="small">
						<Text size="extrasmall" weight="regular" color="error">
							{t(
								'label.not_found_check_the_text_and_try_again',
								'Not found - check the text and try again'
							)}
						</Text>
					</Padding>
				</Container>
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
					setSelectedOperationItem={setDomainView}
				/>
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
					setSelectedOperationItem={setDomainView}
				/>
			)}
		</Container>
	);
};
export default DomainListPanel;
