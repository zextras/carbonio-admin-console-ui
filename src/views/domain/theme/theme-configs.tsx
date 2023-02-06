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
import { isValidHttpsUrl } from '../../utility/utils';
import { themeConfigStore } from '../../../../types/domain';

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
}> = ({ themeConfig, setThemeConfig, setIsValidated, onResetTheme }) => {
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
	const [change, setChange] = useState('end_user');
	const [click, setClick] = useState('');

	const items = [
		{
			id: 'end_user',
			label: t('label.end_user_title', 'END USER'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'admin_panel',
			label: t('label.admin_panel_title', 'ADMIN PANEL'),
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
			isValidCarbonioWebUiLoginLogo
		) {
			setIsValidated(true);
		} else {
			setIsValidated(false);
		}
	}, [
		isValidCarbonioAdminUiAppLogo,
		isValidCarbonioAdminUiBackground,
		isValidCarbonioAdminUiDarkAppLogo,
		isValidCarbonioAdminUiDarkBackground,
		isValidCarbonioAdminUiDarkLoginLogo,
		isValidCarbonioAdminUiFavicon,
		isValidCarbonioAdminUiLoginLogo,
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
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
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
							background="gray5"
							label={t('cos.dark_mode', 'Dark Mode')}
							showCheckbox={false}
							items={THEME_MODE}
							selection={THEME_MODE.find(
								// eslint-disable-next-line max-len
								(item: any) => item.value === themeConfig?.carbonioWebUiDarkMode
							)}
							onChange={onThemeModeChange}
						/>
					</ListRow>
					<ListRow>
						<Padding vertical="large" horizontal="small" width="100%">
							<Text size="small" color="gray0" weight="bold">
								{t('label.logo_redirection', 'Logo Redirection')}
							</Text>
						</Padding>
					</ListRow>
					<ListRow>
						<Input
							label={t(
								'label.logo_redirection_title',
								'Clicking on the Logo will redirect the users to...'
							)}
							background="gray5"
							value={themeConfig.carbonioLogoUrl}
							inputName="carbonioLogoUrl"
							onChange={onChangeDomainThemeDetail}
						/>
					</ListRow>
					<Row
						width="100%"
						mainAlignment="center"
						crossAlignment="center"
						padding={{ top: 'large' }}
					>
						<TabBar
							items={items}
							defaultSelected="end_user"
							onChange={setChange}
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
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.title', 'Title')}
											background="gray5"
											value={themeConfig.carbonioWebUiTitle}
											inputName="carbonioWebUiTitle"
											onChange={onChangeDomainThemeDetail}
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
												'label.title_theme_note',
												'The title is the name that will appear on the browser tab'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.copyrights_information', 'Copyrights information')}
											background="gray5"
											value={themeConfig.carbonioWebUiDescription}
											inputName="carbonioWebUiDescription"
											onChange={onChangeDomainThemeDetail}
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
											label={t('label.logo_path', 'Logo Path')}
											background="gray5"
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
										/>
										{!isValidCarbonioWebUiLoginLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.logo_path', 'Logo Path')}
											background="gray5"
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
											label={t('label.logo_path', 'Logo Path')}
											background="gray5"
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
										/>
										{!isValidCarbonioWebUiAppLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.logo_path', 'Logo Path')}
											background="gray5"
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
											label={t('label.favicon_path', 'Favicon Path')}
											background="gray5"
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
												'Paste the URL of the image for the login page. Use a JPG file, dimension 2560x1440 pixels, 800 KB max.'
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
											label={t('label.image_path', 'Image Path')}
											background="gray5"
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
										/>
										{!isValidCarbonioWebUiLoginBackground && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.image_path', 'Image Path')}
											background="gray5"
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
										/>
										{!isValidCarbonioWebUiDarkLoginBackground && <HttpsErrorMessage />}
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
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.title', 'Title')}
											background="gray5"
											value={themeConfig.carbonioAdminUiTitle}
											inputName="carbonioAdminUiTitle"
											onChange={onChangeDomainThemeDetail}
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
												'label.title_theme_note',
												'The title is the name that will appear on the browser tab'
											)}
										</Text>
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.copyrights_information', 'Copyrights information')}
											background="gray5"
											value={themeConfig.carbonioAdminUiDescription}
											inputName="carbonioAdminUiDescription"
											onChange={onChangeDomainThemeDetail}
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
											label={t('label.logo_path', 'Logo Path')}
											background="gray5"
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
										/>
										{!isValidCarbonioAdminUiLoginLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.logo_path', 'Logo Path')}
											background="gray5"
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
											label={t('label.logo_path', 'Logo Path')}
											background="gray5"
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
										/>
										{!isValidCarbonioAdminUiAppLogo && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.logo_path', 'Logo Path')}
											background="gray5"
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
											label={t('label.favicon_path', 'Favicon Path')}
											background="gray5"
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
												'Paste the URL of the image for the login page. Use a JPG file, dimension 2560x1440 pixels, 800 KB max.'
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
											label={t('label.image_path', 'Image Path')}
											background="gray5"
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
										/>
										{!isValidCarbonioAdminUiBackground && <HttpsErrorMessage />}
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.image_path', 'Image Path')}
											background="gray5"
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
										/>
										{!isValidCarbonioAdminUiDarkBackground && <HttpsErrorMessage />}
									</Container>
								</ListRow>
							</>
						)}
					</Container>
					<Container padding={{ top: 'small' }}>
						<Divider color="gray2" />
					</Container>
					<ListRow>
						<Container padding={{ all: 'small' }}>
							<Padding vertical="large" width="100%">
								<Button
									type="outlined"
									label={t('label.reset', 'Reset')}
									color="error"
									size="fill"
									onClick={onResetTheme}
								/>
							</Padding>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Container>
	);
};
