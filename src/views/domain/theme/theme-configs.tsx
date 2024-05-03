/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Button,
	DefaultTabBarItem,
	TabBar
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';

import { themeConfigStore } from '../../../../types/domain';
import { CONFIG } from '../../../constants';
import { Right, useRightsStore } from '../../../store/rights/store';
import ListRow from '../../list/list-row';
import InheritedInput from '../../utility/inherited-components/inherited-input';
import InheritedSelect from '../../utility/inherited-components/inherited-select';
import { getAllRights, isValidHttpsUrl } from '../../utility/utils';

const HttpsErrorMessage: FC = () => {
	const [t] = useTranslation();
	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
			<Padding top="small">
				<Text size="extrasmall" weight="regular" color="error">
					{t('label.use_https_protocol_message', 'You need to use the HTTPS protocol')}
				</Text>
			</Padding>
		</Container>
	);
};

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
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const [t] = useTranslation();

	const [isValidCarbonioWebUiLoginLogo, setIsValidCarbonioWebUiLoginLogo] = useState<boolean>(true);
	const [isValidCarbonioWebUiDarkLoginLogo, setIsValidCarbonioWebUiDarkLoginLogo] =
		useState<boolean>(true);
	const [isValidCarbonioWebUiLoginBackground, setIsValidCarbonioWebUiLoginBackground] =
		useState<boolean>(true);
	const [isValidCarbonioWebUiDarkLoginBackground, setIsValidCarbonioWebUiDarkLoginBackground] =
		useState<boolean>(true);
	const [isValidCarbonioWebUiAppLogo, setIsValidCarbonioWebUiAppLogo] = useState<boolean>(true);
	const [isValidCarbonioWebUiDarkAppLogo, setIsValidCarbonioWebUiDarkAppLogo] =
		useState<boolean>(true);
	const [isValidCarbonioWebUiFavicon, setIsValidCarbonioWebUiFavicon] = useState<boolean>(true);

	const [isValidCarbonioAdminUiLoginLogo, setIsValidCarbonioAdminUiLoginLogo] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiDarkLoginLogo, setIsValidCarbonioAdminUiDarkLoginLogo] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiAppLogo, setIsValidCarbonioAdminUiAppLogo] = useState<boolean>(true);
	const [isValidCarbonioAdminUiDarkAppLogo, setIsValidCarbonioAdminUiDarkAppLogo] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiBackground, setIsValidCarbonioAdminUiBackground] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiDarkBackground, setIsValidCarbonioAdminUiDarkBackground] =
		useState<boolean>(true);
	const [isValidCarbonioAdminUiFavicon, setIsValidCarbonioAdminUiFavicon] = useState<boolean>(true);
	const [isValidCarbonioAdminLogoutURL, setIsValidCarbonioAdminLogoutURL] = useState<boolean>(true);
	const [isValidCarbonioWebClientLogoutURL, setIsValidCarbonioWebClientLogoutURL] =
		useState<boolean>(true);
	const [isValidCarbonioAdminDocumentationUrl, setIsValidCarbonioAdminDocumentationUrl] =
		useState<boolean>(true);
	const [change, setChange] = useState('end_user');
	const [click, setClick] = useState<string>('');

	const [hasModifyRights, setHasModifyRights] = useState<boolean>(false);
	const rights = useRightsStore((state) => state.rights);

	useEffect(() => {
		if (rights && rights.length > 0 && isGlobalTheme) {
			const allRights = getAllRights(rights, CONFIG);
			if (allRights && allRights.length > 0) {
				const right: Right = allRights[0];
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
		(v): void => {
			setThemeConfig((prev: any) => ({ ...prev, carbonioWebUiDarkMode: v }));
		},
		[setThemeConfig]
	);

	const onChangeDomainThemeDetail = useCallback(
		(e) => {
			setThemeConfig((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setThemeConfig]
	);

	useEffect(() => {
		if (
			isValidCarbonioAdminUiAppLogo &&
			isValidCarbonioAdminUiBackground &&
			isValidCarbonioAdminUiDarkAppLogo &&
			isValidCarbonioAdminUiDarkBackground &&
			isValidCarbonioAdminUiDarkLoginLogo &&
			isValidCarbonioAdminUiFavicon &&
			isValidCarbonioAdminUiLoginLogo &&
			isValidCarbonioWebUiAppLogo &&
			isValidCarbonioWebUiDarkAppLogo &&
			isValidCarbonioWebUiDarkLoginBackground &&
			isValidCarbonioWebUiDarkLoginLogo &&
			isValidCarbonioWebUiFavicon &&
			isValidCarbonioWebUiLoginBackground &&
			isValidCarbonioWebUiLoginLogo &&
			isValidCarbonioAdminLogoutURL &&
			isValidCarbonioWebClientLogoutURL
		) {
			setIsValidated(true);
		} else {
			setIsValidated(false);
		}
	}, [
		isValidCarbonioAdminLogoutURL,
		isValidCarbonioAdminUiAppLogo,
		isValidCarbonioAdminUiBackground,
		isValidCarbonioAdminUiDarkAppLogo,
		isValidCarbonioAdminUiDarkBackground,
		isValidCarbonioAdminUiDarkLoginLogo,
		isValidCarbonioAdminUiFavicon,
		isValidCarbonioAdminUiLoginLogo,
		isValidCarbonioWebClientLogoutURL,
		isValidCarbonioWebUiAppLogo,
		isValidCarbonioWebUiDarkAppLogo,
		isValidCarbonioWebUiDarkLoginBackground,
		isValidCarbonioWebUiDarkLoginLogo,
		isValidCarbonioWebUiFavicon,
		isValidCarbonioWebUiLoginBackground,
		isValidCarbonioWebUiLoginLogo,
		setIsValidated
	]);
	const setEmptyValue = useCallback(
		(keyName) => {
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
								label="ex. #HEX123"
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
								label="ex. #HEX123"
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
							<>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.end_user_webapp', 'End User Webapp')}
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
											{t(
												'label.end_user_theme_description',
												'In this section you can customize the WebApp with your company logo and image.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t(
												'label.title_and_copyrights_information',
												'Title & Copyrights Information'
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
											{t(
												'label.title_theme_note',
												'The title is the name that will appear on the browser tab'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label={t('label.title', 'Title')}
											subValue={themeConfig.carbonioWebUiTitle}
											inheritedValue={globalTheme?.carbonioWebUiTitle}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiTitle : ''}
											inputName="carbonioWebUiTitle"
											onChange={onChangeDomainThemeDetail}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiTitle')}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											{t(
												'label.copyrights_theme_note',
												'The copyrights information will appear on the login box footer'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label={t('label.copyrights_information', 'Copyrights information')}
											subValue={themeConfig.carbonioWebUiDescription}
											inheritedValue={globalTheme?.carbonioWebUiDescription}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiDescription : ''}
											inputName="carbonioWebUiDescription"
											onChange={onChangeDomainThemeDetail}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiDescription')}
										/>
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.logo', 'Logo')}
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
											{t(
												'label.logo_description',
												'Paste the URL of the logo for the login page. Use SVG or PNG file with transparent background, dimension 240x120 pixels.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.light_mode"
												defaults="<bold>Light</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t(
												// eslint-disable-next-line sonarjs/no-duplicate-string
												'label.logo_for_login_page',
												// eslint-disable-next-line sonarjs/no-duplicate-string
												'Logo for Login Page'
											)}
										</Text>
									</Container>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.dark_mode"
												defaults="<bold>Dark</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.logo_for_login_page', 'Logo for Login Page')}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioWebUiLoginLogo}
											inheritedValue={globalTheme?.carbonioWebUiLoginLogo}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiLoginLogo : ''}
											inputName="carbonioWebUiLoginLogo"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebUiLoginLogo(isValid);
												} else {
													setIsValidCarbonioWebUiLoginLogo(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiLoginLogo')}
											hasError={!isValidCarbonioWebUiLoginLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiLoginLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioWebUiDarkLoginLogo}
											inheritedValue={globalTheme?.carbonioWebUiDarkLoginLogo}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiDarkLoginLogo : ''}
											inputName="carbonioWebUiDarkLoginLogo"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebUiDarkLoginLogo(isValid);
												} else {
													setIsValidCarbonioWebUiDarkLoginLogo(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiDarkLoginLogo')}
											hasError={!isValidCarbonioWebUiLoginLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiDarkLoginLogo && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.light_mode"
												defaults="<bold>Light</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t(
												// eslint-disable-next-line sonarjs/no-duplicate-string
												'label.logo_for_webapp',
												// eslint-disable-next-line sonarjs/no-duplicate-string
												'Logo for WebApp'
											)}
										</Text>
									</Container>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.dark_mode"
												defaults="<bold>Dark</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.logo_for_webapp', 'Logo for WebApp')}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioWebUiAppLogo}
											inheritedValue={globalTheme?.carbonioWebUiAppLogo}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiAppLogo : ''}
											inputName="carbonioWebUiAppLogo"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebUiAppLogo(isValid);
												} else {
													setIsValidCarbonioWebUiAppLogo(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiAppLogo')}
											hasError={!isValidCarbonioWebUiAppLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiAppLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioWebUiDarkAppLogo}
											inheritedValue={globalTheme?.carbonioWebUiDarkAppLogo}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiDarkAppLogo : ''}
											inputName="carbonioWebUiDarkAppLogo"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebUiDarkAppLogo(isValid);
												} else {
													setIsValidCarbonioWebUiDarkAppLogo(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiDarkAppLogo')}
											hasError={!isValidCarbonioWebUiDarkAppLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiDarkAppLogo && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.favicon', 'Favicon')}
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
											{t(
												'label.favicon_description',
												'Paste the URL of the favicon for the login page. Use an ICO file, dimension 32x32 pixels.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioWebUiFavicon}
											inheritedValue={globalTheme?.carbonioWebUiFavicon}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiFavicon : ''}
											inputName="carbonioWebUiFavicon"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebUiFavicon(isValid);
												} else {
													setIsValidCarbonioWebUiFavicon(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiFavicon')}
											hasError={!isValidCarbonioWebUiFavicon}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiFavicon && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.background_for_the_login_page', 'Background for the Login Page')}
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
											{t(
												'label.background_description',
												'Paste the URL of the image for the login page. Use a JPG or a PNG file, with a minimum resolution of 1280x720 pixels, a ratio of 16:9 and smaller than 800KB.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.light_mode"
												defaults="<bold>Light</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t(
												// eslint-disable-next-line sonarjs/no-duplicate-string
												'label.background_login_page',
												// eslint-disable-next-line sonarjs/no-duplicate-string
												'Background Login Page'
											)}
										</Text>
									</Container>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.dark_mode"
												defaults="<bold>Dark</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.background_login_page', 'Background Login Page')}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioWebUiLoginBackground}
											inheritedValue={globalTheme?.carbonioWebUiLoginBackground}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiLoginBackground : ''}
											inputName="carbonioWebUiLoginBackground"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebUiLoginBackground(isValid);
												} else {
													setIsValidCarbonioWebUiLoginBackground(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiLoginBackground')}
											hasError={!isValidCarbonioWebUiLoginBackground}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiLoginBackground && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioWebUiDarkLoginBackground}
											inheritedValue={globalTheme?.carbonioWebUiDarkLoginBackground}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUiDarkLoginBackground : ''}
											inputName="carbonioWebUiDarkLoginBackground"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebUiDarkLoginBackground(isValid);
												} else {
													setIsValidCarbonioWebUiDarkLoginBackground(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUiDarkLoginBackground')}
											hasError={!isValidCarbonioWebUiDarkLoginBackground}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiDarkLoginBackground && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<ListRow>
										<Container
											mainAlignment="flex-start"
											crossAlignment="flex-start"
											padding={{ vertical: 'large', horizontal: 'small' }}
										>
											<Text size="small" color="gray0">
												<Trans
													i18nKey="label.please_note"
													defaults="<bold>Please note</bold>"
													components={{ bold: <strong /> }}
												/>{' '}
												{t(
													'label.virtualhost_avaibility_helpertext',
													'that in order to make the virtualHost available, nginx configuration must be reloaded on all the proxyes first.'
												)}
											</Text>
										</Container>
									</ListRow>
								</ListRow>
								<ListRow>
									<Container padding={{ bottom: 'small', horizontal: 'small' }}>
										<ListRow>
											<Padding bottom="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.login', 'Login')}
												</Text>
											</Padding>
										</ListRow>
										<InheritedInput
											label={t(
												'label.enduser_login_redirect_url',
												'LogIn redirect destination (URL)'
											)}
											subValue={themeConfig.carbonioWebUILoginURL}
											inheritedValue={globalTheme?.carbonioWebUILoginURL}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUILoginURL : ''}
											inputName="carbonioWebUILoginURL"
											onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebClientLogoutURL(isValid);
												} else {
													setIsValidCarbonioWebClientLogoutURL(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUILoginURL')}
											hasError={!isValidCarbonioWebClientLogoutURL}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebClientLogoutURL && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ bottom: 'small', horizontal: 'small' }}>
										<ListRow>
											<Padding bottom="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.logout', 'Logout')}
												</Text>
											</Padding>
										</ListRow>
										<InheritedInput
											label={t(
												'label.enduser_logout_redirect_url',
												'On Logout, redirect the User to (URL)'
											)}
											subValue={themeConfig.carbonioWebUILogoutURL}
											inheritedValue={globalTheme?.carbonioWebUILogoutURL}
											fromSubValue={globalTheme ? themeConfig.carbonioWebUILogoutURL : ''}
											inputName="carbonioWebUILogoutURL"
											onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebClientLogoutURL(isValid);
												} else {
													setIsValidCarbonioWebClientLogoutURL(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioWebUILogoutURL')}
											hasError={!isValidCarbonioWebClientLogoutURL}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebClientLogoutURL && <HttpsErrorMessage />}
									</Container>
								</ListRow>
							</>
						)}
						{change === 'admin_panel' && (
							<>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.admin_panel', 'Admin Panel')}
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
											{t(
												'label.admin_panel_theme_description',
												'In this section you can customize the Admin Panel with your company logo and image.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t(
												'label.title_and_copyrights_information',
												'Title & Copyrights Information'
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
											{t(
												'label.title_theme_note',
												'The title is the name that will appear on the browser tab'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label={t('label.title', 'Title')}
											subValue={themeConfig.carbonioAdminUiTitle}
											inheritedValue={globalTheme?.carbonioAdminUiTitle}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiTitle : ''}
											inputName="carbonioAdminUiTitle"
											onChange={onChangeDomainThemeDetail}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiTitle')}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											{t(
												'label.copyrights_theme_note',
												'The copyrights information will appear on the login box footer'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label={t('label.copyrights_information', 'Copyrights information')}
											subValue={themeConfig.carbonioAdminUiDescription}
											inheritedValue={globalTheme?.carbonioAdminUiDescription}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiDescription : ''}
											inputName="carbonioAdminUiDescription"
											onChange={onChangeDomainThemeDetail}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiDescription')}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.logo', 'Logo')}
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
											{t(
												'label.logo_description',
												'Paste the URL of the logo for the login page. Use SVG or PNG file with transparent background, dimension 240x120 pixels.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.light_mode"
												defaults="<bold>Light</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.logo_for_login_page', 'Logo for Login Page')}
										</Text>
									</Container>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.dark_mode"
												defaults="<bold>Dark</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.logo_for_login_page', 'Logo for Login Page')}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioAdminUiLoginLogo}
											inheritedValue={globalTheme?.carbonioAdminUiLoginLogo}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiLoginLogo : ''}
											inputName="carbonioAdminUiLoginLogo"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminUiLoginLogo(isValid);
												} else {
													setIsValidCarbonioAdminUiLoginLogo(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiLoginLogo')}
											hasError={!isValidCarbonioAdminUiLoginLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiLoginLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioAdminUiDarkLoginLogo}
											inheritedValue={globalTheme?.carbonioAdminUiDarkLoginLogo}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiDarkLoginLogo : ''}
											inputName="carbonioAdminUiDarkLoginLogo"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminUiDarkLoginLogo(isValid);
												} else {
													setIsValidCarbonioAdminUiDarkLoginLogo(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiDarkLoginLogo')}
											hasError={!isValidCarbonioAdminUiDarkLoginLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiDarkLoginLogo && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.light_mode"
												defaults="<bold>Light</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.logo_for_webapp', 'Logo for WebApp')}
										</Text>
									</Container>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.dark_mode"
												defaults="<bold>Dark</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.logo_for_webapp', 'Logo for WebApp')}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioAdminUiAppLogo}
											inheritedValue={globalTheme?.carbonioAdminUiAppLogo}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiAppLogo : ''}
											inputName="carbonioAdminUiAppLogo"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminUiAppLogo(isValid);
												} else {
													setIsValidCarbonioAdminUiAppLogo(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiAppLogo')}
											hasError={!isValidCarbonioAdminUiAppLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiAppLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioAdminUiDarkAppLogo}
											inheritedValue={globalTheme?.carbonioAdminUiDarkAppLogo}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiDarkAppLogo : ''}
											inputName="carbonioAdminUiDarkAppLogo"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminUiDarkAppLogo(isValid);
												} else {
													setIsValidCarbonioAdminUiDarkAppLogo(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiDarkAppLogo')}
											hasError={!isValidCarbonioAdminUiDarkAppLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiDarkAppLogo && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.favicon', 'Favicon')}
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
											{t(
												'label.favicon_description',
												'Paste the URL of the favicon for the login page. Use an ICO file, dimension 32x32 pixels.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioAdminUiFavicon}
											inheritedValue={globalTheme?.carbonioAdminUiFavicon}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiFavicon : ''}
											inputName="carbonioAdminUiFavicon"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminUiFavicon(isValid);
												} else {
													setIsValidCarbonioAdminUiFavicon(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiFavicon')}
											hasError={!isValidCarbonioAdminUiFavicon}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiFavicon && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.background_for_the_login_page', 'Background for the Login Page')}
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
											{t(
												'label.background_description',
												'Paste the URL of the image for the login page. Use a JPG or a PNG file, with a minimum resolution of 1280x720 pixels, a ratio of 16:9 and smaller than 800KB.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.light_mode"
												defaults="<bold>Light</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.background_login_page', 'Background Login Page')}
										</Text>
									</Container>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.dark_mode"
												defaults="<bold>Dark</bold> Mode"
												components={{ bold: <strong /> }}
											/>{' '}
											{t('label.background_login_page', 'Background Login Page')}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioAdminUiBackground}
											inheritedValue={globalTheme?.carbonioAdminUiBackground}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiBackground : ''}
											inputName="carbonioAdminUiBackground"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminUiBackground(isValid);
												} else {
													setIsValidCarbonioAdminUiBackground(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiBackground')}
											hasError={!isValidCarbonioAdminUiBackground}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiBackground && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<InheritedInput
											label="Ex. https://upload.yourlogo.com/"
											subValue={themeConfig.carbonioAdminUiDarkBackground}
											inheritedValue={globalTheme?.carbonioAdminUiDarkBackground}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUiDarkBackground : ''}
											inputName="carbonioAdminUiDarkBackground"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminUiDarkBackground(isValid);
												} else {
													setIsValidCarbonioAdminUiDarkBackground(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUiDarkBackground')}
											hasError={!isValidCarbonioAdminUiDarkBackground}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiDarkBackground && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<Container
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ vertical: 'large', horizontal: 'small' }}
									>
										<Text size="small" color="gray0">
											<Trans
												i18nKey="label.please_note"
												defaults="<bold>Please note</bold>"
												components={{ bold: <strong /> }}
											/>{' '}
											{t(
												'label.virtualhost_avaibility_helpertext',
												'that in order to make the virtualHost available, nginx configuration must be reloaded on all the proxyes first.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ bottom: 'small', horizontal: 'small' }}>
										<ListRow>
											<Padding bottom="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.login', 'Login')}
												</Text>
											</Padding>
										</ListRow>
										<InheritedInput
											label={t(
												'label.enduser_login_redirect_url',
												'LogIn redirect destination (URL)'
											)}
											subValue={themeConfig.carbonioAdminUILoginURL}
											inheritedValue={globalTheme?.carbonioAdminUILoginURL}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUILoginURL : ''}
											inputName="carbonioAdminUILoginURL"
											onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminLogoutURL(isValid);
												} else {
													setIsValidCarbonioAdminLogoutURL(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUILoginURL')}
											hasError={!isValidCarbonioAdminLogoutURL}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminLogoutURL && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ bottom: 'small', horizontal: 'small' }}>
										<ListRow>
											<Padding bottom="large" horizontal="small" width="100%">
												<Text size="small" color="gray0" weight="bold">
													{t('label.logout', 'Logout')}
												</Text>
											</Padding>
										</ListRow>
										<InheritedInput
											label={t(
												'label.enduser_logout_redirect_url',
												'On Logout, redirect the User to (URL)'
											)}
											subValue={themeConfig.carbonioAdminUILogoutURL}
											inheritedValue={globalTheme?.carbonioAdminUILogoutURL}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminUILogoutURL : ''}
											inputName="carbonioAdminUILogoutURL"
											onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminLogoutURL(isValid);
												} else {
													setIsValidCarbonioAdminLogoutURL(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminUILogoutURL')}
											hasError={!isValidCarbonioAdminLogoutURL}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminLogoutURL && <HttpsErrorMessage />}
									</Container>
								</ListRow>
								<Container padding={{ top: 'small' }}>
									<Divider color="gray2" />
								</Container>
								<ListRow>
									<Padding top="large" bottom="small" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.help_documentation_url', 'Help documentation URL')}
										</Text>
									</Padding>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										{console.log(
											'_dd themeConfig.carbonioAdminDocumentationUrl',
											themeConfig.carbonioAdminDocumentationUrl
										)}
										{console.log(
											'_dd globalTheme?.carbonioAdminDocumentationUrl',
											globalTheme?.carbonioAdminDocumentationUrl
										)}
										<InheritedInput
											label={t(
												'label.upload_yourdocs_placeholder',
												'Ex. https://upload.yourdocs.com/'
											)}
											subValue={themeConfig.carbonioAdminDocumentationUrl}
											inheritedValue={globalTheme?.carbonioAdminDocumentationUrl}
											fromSubValue={globalTheme ? themeConfig.carbonioAdminDocumentationUrl : ''}
											inputName="carbonioAdminDocumentationUrl"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminDocumentationUrl(isValid);
												} else {
													setIsValidCarbonioAdminDocumentationUrl(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											onChangeReset={(): void => setEmptyValue('carbonioAdminDocumentationUrl')}
											hasError={!isValidCarbonioAdminDocumentationUrl}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminDocumentationUrl && <HttpsErrorMessage />}
									</Container>
								</ListRow>
							</>
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
