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
	Input,
	Button,
	Select,
	DefaultTabBarItem,
	TabBar
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import ListRow from '../../list/list-row';
import { getAllRights, isValidHttpsUrl } from '../../utility/utils';
import { themeConfigStore } from '../../../../types/domain';
import { CONFIG } from '../../../constants';
import { Right, useRightsStore } from '../../../store/rights/store';

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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore // Need to fix it with custom soultion
		index={index}
		selected={selected}
		onClick={onClick}
		orientation="horizontal"
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
	setThemeConfig: CallableFunction;
	setIsValidated: CallableFunction;
	onResetTheme: CallableFunction;
	isGlobalTheme?: boolean;
}> = ({ themeConfig, setThemeConfig, setIsValidated, onResetTheme, isGlobalTheme = false }) => {
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
	const [change, setChange] = useState('end_user');
	const [click, setClick] = useState('');

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

	const items = [
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

	const THEME_MODE = useMemo(
		() => [
			{ label: `${t('label.disabled', 'Disabled')}`, value: 'FALSE' },
			{ label: `${t('label.enabled', 'Enabled')}`, value: 'TRUE' }
		],
		[t]
	);

	const onThemeModeChange = useCallback(
		(v: string): void => {
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
						<Select
							backgroundColor="gray5"
							label={t('cos.dark_mode', 'Dark Mode')}
							showCheckbox={false}
							items={THEME_MODE}
							selection={THEME_MODE.find(
								// eslint-disable-next-line max-len
								(item: any) => item.value === themeConfig?.carbonioWebUiDarkMode
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onThemeModeChange}
							disabled={isGlobalTheme && !hasModifyRights}
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
						<Input
							label={t(
								'label.logo_redirection_title',
								'Clicking on the Logo will redirect the users to...'
							)}
							backgroundColor="gray5"
							value={themeConfig.carbonioLogoUrl}
							inputName="carbonioLogoUrl"
							onChange={onChangeDomainThemeDetail}
							disabled={isGlobalTheme && !hasModifyRights}
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
							<Input
								label="ex. #HEX123"
								backgroundColor="gray5"
								value={themeConfig.carbonioWebUiPrimaryColor}
								inputName="carbonioWebUiPrimaryColor"
								onChange={(e: any): any => {
									onChangeDomainThemeDetail(e);
								}}
								disabled={isGlobalTheme && !hasModifyRights}
							/>
						</Container>
						<Container padding={{ all: 'small' }}>
							<Input
								label="ex. #HEX123"
								backgroundColor="gray5"
								value={themeConfig.carbonioWebUiDarkPrimaryColor}
								inputName="carbonioWebUiDarkPrimaryColor"
								onChange={(e: any): any => {
									onChangeDomainThemeDetail(e);
								}}
								disabled={isGlobalTheme && !hasModifyRights}
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
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							items={items}
							selected={change}
							onChange={(ev: unknown, selectedId: string): void => {
								setChange(selectedId);
							}}
							onItemClick={setClick}
							width={300}
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
										<Input
											label={t('label.title', 'Title')}
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiTitle}
											inputName="carbonioWebUiTitle"
											onChange={onChangeDomainThemeDetail}
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
										<Input
											label={t('label.copyrights_information', 'Copyrights information')}
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiDescription}
											inputName="carbonioWebUiDescription"
											onChange={onChangeDomainThemeDetail}
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
										<Input
											label="Ex. https://upload.yourlogo.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiLoginLogo}
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
											hasError={!isValidCarbonioWebUiLoginLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiLoginLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label="Ex. https://upload.yourlogo.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiDarkLoginLogo}
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
											hasError={!isValidCarbonioWebUiDarkLoginLogo}
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
										<Input
											label="Ex. https://upload.yourlogo.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiAppLogo}
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
											hasError={!isValidCarbonioWebUiAppLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiAppLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label="Ex. https://upload.yourlogo.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiDarkAppLogo}
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
												'Paste the URL of the favicon for the login page. Use a ICO file, dimension 16x16 pixels.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label="Ex. https://upload.yourfavicon.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiFavicon}
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
												'Paste the URL of the image for the login page. Use a JPG or a PNG file, with a resolution of 1280x720 pixels, ratio of 16:9 and smaller than 800KB.'
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
										<Input
											label="Ex. https://upload.yourimage.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiLoginBackground}
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
											hasError={!isValidCarbonioWebUiLoginBackground}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioWebUiLoginBackground && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label="Ex. https://upload.yourimage.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioWebUiDarkLoginBackground}
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
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.logout', 'Logout')}
										</Text>
									</Padding>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t(
												'label.enduser_logout_redirect_url',
												'On Logout, redirect the User to (URL)'
											)}
											backgroundColor="gray5"
											value={themeConfig.zimbraWebClientLogoutURL}
											inputName="zimbraWebClientLogoutURL"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioWebClientLogoutURL(isValid);
												} else {
													setIsValidCarbonioWebClientLogoutURL(true);
												}
												onChangeDomainThemeDetail(e);
											}}
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
										<Input
											label={t('label.title', 'Title')}
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiTitle}
											inputName="carbonioAdminUiTitle"
											onChange={onChangeDomainThemeDetail}
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
										<Input
											label={t('label.copyrights_information', 'Copyrights information')}
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiDescription}
											inputName="carbonioAdminUiDescription"
											onChange={onChangeDomainThemeDetail}
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
										<Input
											label="Ex. https://upload.yourlogo.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiLoginLogo}
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
											hasError={!isValidCarbonioAdminUiLoginLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiLoginLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label="Ex. https://upload.yourlogo.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiDarkLoginLogo}
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
										<Input
											label="Ex. https://upload.yourlogo.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiAppLogo}
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
											hasError={!isValidCarbonioAdminUiAppLogo}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiAppLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label="Ex. https://upload.yourlogo.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiDarkAppLogo}
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
												'Paste the URL of the favicon for the login page. Use a ICO file, dimension 16x16 pixels.'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label="Ex. https://upload.yourfavicon.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiFavicon}
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
												'Paste the URL of the image for the login page. Use a JPG or a PNG file, with a resolution of 1280x720 pixels, ratio of 16:9 and smaller than 800KB.'
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
										<Input
											label="Ex. https://upload.yourimage.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiBackground}
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
											hasError={!isValidCarbonioAdminUiBackground}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminUiBackground && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label="Ex. https://upload.yourimage.com/"
											backgroundColor="gray5"
											value={themeConfig.carbonioAdminUiDarkBackground}
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
									<Padding vertical="large" horizontal="small" width="100%">
										<Text size="small" color="gray0" weight="bold">
											{t('label.logout', 'Logout')}
										</Text>
									</Padding>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t(
												'label.admin_logout_redirect_url',
												'On Logout, redirect the Admin to (URL)'
											)}
											backgroundColor="gray5"
											value={themeConfig.zimbraAdminConsoleLogoutURL}
											inputName="zimbraAdminConsoleLogoutURL"
											onChange={(e: any): any => {
												if (e.target.value) {
													const isValid = isValidHttpsUrl(e.target.value);
													setIsValidCarbonioAdminLogoutURL(isValid);
												} else {
													setIsValidCarbonioAdminLogoutURL(true);
												}
												onChangeDomainThemeDetail(e);
											}}
											hasError={!isValidCarbonioAdminLogoutURL}
											disabled={isGlobalTheme && !hasModifyRights}
										/>
										{!isValidCarbonioAdminLogoutURL && <HttpsErrorMessage />}
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
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore // Need to fix it with custom soultion
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
