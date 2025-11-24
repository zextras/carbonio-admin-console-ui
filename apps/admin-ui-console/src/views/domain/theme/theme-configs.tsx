/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	getAllRights,
	useCurrentUserRights
} from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Button,
	DefaultTabBarItem,
	TabBar,
	SelectItem
} from '@zextras/carbonio-design-system';
import React, {
	ChangeEvent,
	FC,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { themeConfigStore } from '../../../../types/domain';
import { CONFIG, PRIMARY_COLOR_CODE_EX } from '../../../constants';
import ListRow from '../../list/list-row';
import InheritedInput from '../../utility/inherited-components/inherited-input';
import InheritedSelect from '../../utility/inherited-components/inherited-select';

import AdminPanelThemeConfig from './admin-panel-theme-configs';
import EndUserThemeConfigs from './end-user-theme-configs';

const ReusedDefaultTabBar: FC<{
	item: any;
	index: any;
	selected: any;
	onClick: any;
}> = ({ item, index, selected, onClick }): ReactElement => (
	<DefaultTabBarItem
		item={item}
		selected={selected}
		onClick={onClick}
		orientation="horizontal"
		background="gray6"
		underlineColor="primary"
		forceWidthEquallyDistributed={false}
	>
		<Row padding="small">
			<Text size="small" color={selected ? 'primary' : 'gray'}>
				{item.label}
			</Text>
		</Row>
	</DefaultTabBarItem>
);

export const ThemeConfigs: FC<{
	themeConfig: themeConfigStore;
	globalTheme?: themeConfigStore | undefined;
	setThemeConfig: CallableFunction;
	setIsValidated: CallableFunction;
	onResetTheme: any;
	isGlobalTheme?: boolean;
}> = ({
	themeConfig,
	globalTheme = undefined,
	setThemeConfig,
	setIsValidated,
	onResetTheme,
	isGlobalTheme = false
}) => {
	const [t] = useTranslation();
	const [allData, setAllData] = useState({
		isValidCarbonioAdminUiLoginLogo: true,
		isValidCarbonioAdminUiDarkLoginLogo: true,
		isValidCarbonioAdminUiAppLogo: true,
		isValidCarbonioAdminUiDarkAppLogo: true,
		isValidCarbonioAdminUiBackground: true,
		isValidCarbonioAdminUiDarkBackground: true,
		isValidCarbonioAdminUiFavicon: true,
		isValidCarbonioAdminLogoutURL: true,
		isValidCarbonioWebClientLogoutURL: true,
		isValidCarbonioAdminDocumentationUrl: true,
		isValidCarbonioWebUiAppLogo: true,
		isValidCarbonioWebUiDarkAppLogo: true,
		isValidCarbonioWebUiDarkLoginBackground: true,
		isValidCarbonioWebUiDarkLoginLogo: true,
		isValidCarbonioWebUiFavicon: true,
		isValidCarbonioWebUiLoginBackground: true,
		isValidCarbonioWebUiLoginLogo: true
	});
	const [change, setChange] = useState('end_user');

	const [hasModifyRights, setHasModifyRights] = useState<boolean>(false);
	const { data: rights } = useCurrentUserRights();

	useEffect(() => {
		if (rights && rights.length > 0 && isGlobalTheme) {
			const allRights = getAllRights(rights, CONFIG);
			if (allRights && allRights.length > 0) {
				const right = allRights[0];
				if (
					right?.all &&
					Array.isArray(right?.all) &&
					right?.all.length > 0 &&
					right?.all[0].setAttrs &&
					right?.all[0].setAttrs.length > 0
				) {
					right?.all[0].setAttrs.forEach((item: Record<string, unknown>) => {
						if (item?.all && item?.all === true) {
							setHasModifyRights(true);
						}
					});
				}
			}
		}
	}, [rights, isGlobalTheme]);

	const items: any = [
		{
			id: 'end_user',
			label: `${t('label.end_user_title', 'END USER')}`,
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'admin_panel',
			label: `${t('label.admin_panel_title', 'ADMIN PANEL')}`,
			CustomComponent: ReusedDefaultTabBar
		}
	];

	const THEME_MODE: any = useMemo(
		() => [
			{ label: `${t('label.disabled', 'Disabled')}`, value: 'FALSE' },
			{ label: `${t('label.enabled', 'Enabled')}`, value: 'TRUE' }
		],
		[t]
	);

	const onThemeModeChange = useCallback(
		(v: SelectItem[] | string | null): void => {
			setThemeConfig((prev: any) => ({ ...prev, carbonioWebUiDarkMode: v }));
		},
		[setThemeConfig]
	);

	const onChangeDomainThemeDetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setThemeConfig((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setThemeConfig]
	);

	useEffect(() => {
		if (
			allData.isValidCarbonioAdminUiAppLogo &&
			allData.isValidCarbonioAdminUiBackground &&
			allData.isValidCarbonioAdminUiDarkAppLogo &&
			allData.isValidCarbonioAdminUiDarkBackground &&
			allData.isValidCarbonioAdminUiDarkLoginLogo &&
			allData.isValidCarbonioAdminUiFavicon &&
			allData.isValidCarbonioAdminUiLoginLogo &&
			allData.isValidCarbonioWebUiAppLogo &&
			allData.isValidCarbonioWebUiDarkAppLogo &&
			allData.isValidCarbonioWebUiDarkLoginBackground &&
			allData.isValidCarbonioWebUiDarkLoginLogo &&
			allData.isValidCarbonioWebUiFavicon &&
			allData.isValidCarbonioWebUiLoginBackground &&
			allData.isValidCarbonioWebUiLoginLogo &&
			allData.isValidCarbonioAdminLogoutURL &&
			allData.isValidCarbonioWebClientLogoutURL
		) {
			setIsValidated(true);
		} else {
			setIsValidated(false);
		}
	}, [
		allData.isValidCarbonioAdminLogoutURL,
		allData.isValidCarbonioAdminUiAppLogo,
		allData.isValidCarbonioAdminUiBackground,
		allData.isValidCarbonioAdminUiDarkAppLogo,
		allData.isValidCarbonioAdminUiDarkBackground,
		allData.isValidCarbonioAdminUiDarkLoginLogo,
		allData.isValidCarbonioAdminUiFavicon,
		allData.isValidCarbonioAdminUiLoginLogo,
		allData.isValidCarbonioWebClientLogoutURL,
		allData.isValidCarbonioWebUiAppLogo,
		allData.isValidCarbonioWebUiDarkAppLogo,
		allData.isValidCarbonioWebUiDarkLoginBackground,
		allData.isValidCarbonioWebUiDarkLoginLogo,
		allData.isValidCarbonioWebUiFavicon,
		allData.isValidCarbonioWebUiLoginBackground,
		allData.isValidCarbonioWebUiLoginLogo,
		setIsValidated
	]);
	const setEmptyValue = useCallback(
		(keyName: string) => {
			setThemeConfig((prev: any) => ({ ...prev, [keyName]: undefined }));
		},
		[setThemeConfig]
	);
	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			style={{ overflow: 'auto' }}
			width="100%"
			height="calc(100vh - 150px)"
		>
			<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
				<Container
					padding={{ all: 'small' }}
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
				>
					<ListRow>
						<Padding vertical="large" horizontal="small" width="100%">
							<Text size="small" color="gray0" weight="bold">
								{t('label.apperance', 'Apperance')}
							</Text>
						</Padding>
					</ListRow>
					<ListRow>
						<InheritedSelect
							label={t('cos.dark_mode', 'Dark Mode')}
							items={THEME_MODE}
							subValue={themeConfig.carbonioWebUiDarkMode}
							inheritedValue={globalTheme?.carbonioWebUiDarkMode}
							fromSubValue={globalTheme ? themeConfig.carbonioWebUiDarkMode : ''}
							background="gray5"
							selectName="carbonioWebUiDarkMode"
							onChange={onThemeModeChange}
							onChangeReset={(): void => setEmptyValue('carbonioWebUiDarkMode')}
						/>
					</ListRow>
					<ListRow>
						<Padding vertical="large" horizontal="small" width="100%">
							<Text size="small" color="gray0" weight="bold">
								{t('label.logo_url_destination', 'Logo URL Destination')}
							</Text>
						</Padding>
					</ListRow>
					<ListRow>
						<InheritedInput
							label={t(
								'label.logo_redirection_title',
								'Clicking on the Logo will redirect the users to...'
							)}
							subValue={themeConfig.carbonioLogoUrl}
							inheritedValue={globalTheme?.carbonioLogoUrl}
							fromSubValue={globalTheme ? themeConfig.carbonioLogoUrl : ''}
							inputName="carbonioLogoUrl"
							onChange={onChangeDomainThemeDetail}
							onChangeReset={(): void => setEmptyValue('carbonioLogoUrl')}
						/>
					</ListRow>
					<ListRow>
						<Padding vertical="large" horizontal="small" width="100%">
							<Text size="small" color="gray0" weight="bold">
								{t('label.color_scheme', 'Color Scheme')}
							</Text>
						</Padding>
					</ListRow>
					<ListRow>
						<Padding vertical="small" horizontal="small" width="100%">
							<Text size="small" color="gray0">
								{t(
									'label.primary_color_hint',
									'To change the Primary color, please use a HEX color code.'
								)}
							</Text>
						</Padding>
					</ListRow>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Text size="small" color="gray0">
								<Trans
									i18nKey="label.primary_color_for_light_mode"
									defaults="<bold>Primary</bold> Color for Light Mode"
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Text size="small" color="gray0">
								<Trans
									i18nKey="label.primary_color_for_dark_mode"
									defaults="<bold>Primary</bold> Color for Dark Mode"
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Container>
					</ListRow>
					<ListRow>
						<Container padding={{ all: 'small' }}>
							<InheritedInput
								label={PRIMARY_COLOR_CODE_EX}
								subValue={themeConfig.carbonioWebUiPrimaryColor}
								inheritedValue={globalTheme?.carbonioWebUiPrimaryColor}
								fromSubValue={globalTheme ? themeConfig.carbonioWebUiPrimaryColor : ''}
								inputName="carbonioWebUiPrimaryColor"
								onChange={(e: any): any => {
									onChangeDomainThemeDetail(e);
								}}
								onChangeReset={(): void => setEmptyValue('carbonioWebUiPrimaryColor')}
							/>
						</Container>
						<Container padding={{ all: 'small' }}>
							<InheritedInput
								label={PRIMARY_COLOR_CODE_EX}
								subValue={themeConfig.carbonioWebUiDarkPrimaryColor}
								inheritedValue={globalTheme?.carbonioWebUiDarkPrimaryColor}
								fromSubValue={globalTheme ? themeConfig.carbonioWebUiDarkPrimaryColor : ''}
								inputName="carbonioWebUiDarkPrimaryColor"
								onChange={(e: any): any => {
									onChangeDomainThemeDetail(e);
								}}
								onChangeReset={(): void => setEmptyValue('carbonioWebUiDarkPrimaryColor')}
							/>
						</Container>
					</ListRow>
					<Row
						width="100%"
						mainAlignment="center"
						crossAlignment="center"
						padding={{ top: 'large' }}
					>
						<TabBar
							items={items}
							selected={change}
							onChange={(ev: unknown, selectedId: string): void => {
								setChange(selectedId);
							}}
							onClick={(): void => {
								// console.log('__');
							}}
							width={300}
							background="gray6"
						/>
					</Row>
					<Row width="100%">
						<Divider color="gray2" />
					</Row>
					<Container crossAlignment="flex-start" padding={{ all: '0px' }}>
						{change === 'end_user' && (
							<EndUserThemeConfigs
								themeConfig={themeConfig}
								globalTheme={globalTheme}
								onChangeDomainThemeDetail={onChangeDomainThemeDetail}
								setEmptyValue={setEmptyValue}
								isGlobalTheme={isGlobalTheme}
								hasModifyRights={hasModifyRights}
								allData={allData}
								setAllData={setAllData}
							/>
						)}
						{change === 'admin_panel' && (
							<AdminPanelThemeConfig
								themeConfig={themeConfig}
								globalTheme={globalTheme}
								onChangeDomainThemeDetail={onChangeDomainThemeDetail}
								setEmptyValue={setEmptyValue}
								isGlobalTheme={isGlobalTheme}
								hasModifyRights={hasModifyRights}
								allData={allData}
								setAllData={setAllData}
							/>
						)}
					</Container>
					<Container padding={{ top: 'small' }}>
						<Divider color="gray2" />
					</Container>
					<ListRow>
						<Container padding={{ all: 'small' }} width="100%" style={{ display: 'block' }}>
							<Padding vertical="large" width="100%">
								<Button
									type="outlined"
									label={t('label.empty_all_fields', 'Empty all fields')}
									color="error"
									size="large"
									width="fill"
									onClick={onResetTheme}
									style={{ width: '100%' }}
									disabled={isGlobalTheme && !hasModifyRights}
								/>
							</Padding>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Container>
	);
};
